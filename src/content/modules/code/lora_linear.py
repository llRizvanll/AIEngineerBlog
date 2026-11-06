import math

import torch
from torch import nn


class LoRALinear(nn.Module):
    """Wraps a frozen nn.Linear with a trainable low-rank update: W + (alpha / r) * B @ A."""

    def __init__(self, base: nn.Linear, r: int = 16, alpha: float = 32.0, dropout: float = 0.05):
        super().__init__()
        self.base = base
        self.base.requires_grad_(False)
        self.lora_A = nn.Parameter(torch.empty(r, base.in_features))
        self.lora_B = nn.Parameter(torch.zeros(base.out_features, r))  # zero: starts as the base model
        nn.init.kaiming_uniform_(self.lora_A, a=math.sqrt(5))
        self.scale = alpha / r
        self.dropout = nn.Dropout(dropout)
        self.merged = False

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        out = self.base(x)
        if self.merged:
            return out
        return out + (self.dropout(x) @ self.lora_A.T @ self.lora_B.T) * self.scale

    @torch.no_grad()
    def merge(self) -> None:
        if not self.merged:
            self.base.weight += self.scale * (self.lora_B @ self.lora_A)
            self.merged = True
