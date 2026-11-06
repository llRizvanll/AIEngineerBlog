import triton
import triton.language as tl


@triton.jit
def paged_scores(q_ptr, keys_ptr, table_ptr, scores_ptr,
                 BLOCK_TOKENS: tl.constexpr, HEAD_DIM: tl.constexpr):
    logical = tl.program_id(0)                 # one program per logical block
    physical = tl.load(table_ptr + logical)    # follow the block table

    dims = tl.arange(0, HEAD_DIM)
    toks = tl.arange(0, BLOCK_TOKENS)
    q = tl.load(q_ptr + dims)                  # [HEAD_DIM]

    # Keys live in one big pool: [physical block, token, dim].
    offs = physical * BLOCK_TOKENS * HEAD_DIM + toks[:, None] * HEAD_DIM + dims[None, :]
    k = tl.load(keys_ptr + offs)               # [BLOCK_TOKENS, HEAD_DIM]

    scores = tl.sum(k * q[None, :], axis=1)    # dot product per token
    tl.store(scores_ptr + logical * BLOCK_TOKENS + toks, scores)
