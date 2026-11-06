import torch
import triton
import triton.language as tl


@triton.jit
def softmax_kernel(output_ptr, input_ptr, n_elements, stride, BLOCK_SIZE: tl.constexpr):
    row = tl.program_id(0)                     # one program per row
    col = tl.arange(0, BLOCK_SIZE)
    mask = col < n_elements

    x = tl.load(input_ptr + row * stride + col, mask=mask, other=-float("inf"))
    x = x - tl.max(x, axis=0)                  # all in one pass: no extra trips to memory
    numerator = tl.exp(x)
    denominator = tl.sum(numerator, axis=0)

    tl.store(output_ptr + row * stride + col, numerator / denominator, mask=mask)


def softmax(x: torch.Tensor) -> torch.Tensor:
    rows, cols = x.shape
    block = triton.next_power_of_2(cols)
    out = torch.empty_like(x)
    softmax_kernel[(rows,)](out, x, cols, x.stride(0), BLOCK_SIZE=block,
                            num_warps=4 if block <= 256 else 8)
    return out
