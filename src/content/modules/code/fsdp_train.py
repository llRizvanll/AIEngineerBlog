import functools

import torch
from torch.distributed.fsdp import FullyShardedDataParallel as FSDP
from torch.distributed.fsdp.wrap import transformer_auto_wrap_policy


def wrap(model: torch.nn.Module, block_cls: type) -> FSDP:
    # Shard per transformer block: each block gathers its weights only while it runs.
    policy = functools.partial(transformer_auto_wrap_policy, transformer_layer_cls={block_cls})
    return FSDP(model, auto_wrap_policy=policy, device_id=torch.cuda.current_device())


def train_step(model: FSDP, batch: dict, optimizer: torch.optim.Optimizer) -> float:
    loss = model(**batch).loss
    loss.backward()
    model.clip_grad_norm_(1.0)     # FSDP's own version: gradients live on different ranks
    optimizer.step()
    optimizer.zero_grad(set_to_none=True)
    return loss.item()
