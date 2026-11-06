#!/bin/bash
#SBATCH --job-name=train-70b
#SBATCH --nodes=4
#SBATCH --ntasks-per-node=1
#SBATCH --gres=gpu:8
#SBATCH --cpus-per-task=64
#SBATCH --time=24:00:00
#SBATCH --requeue
#SBATCH --signal=B:USR1@300        # warn this script 5 minutes before the time limit
#SBATCH --output=logs/%x-%j.out

# On the warning: stop cleanly (training saves on SIGTERM), then go back in the queue.
trap 'scontrol requeue "$SLURM_JOB_ID"; kill -TERM "$TRAIN_PID"' USR1

export MASTER_ADDR=$(scontrol show hostnames "$SLURM_JOB_NODELIST" | head -n 1)
export MASTER_PORT=29500

srun torchrun --nnodes="$SLURM_NNODES" --nproc-per-node=8 \
  --rdzv-backend=c10d --rdzv-endpoint="$MASTER_ADDR:$MASTER_PORT" \
  train.py --resume-from-latest &
TRAIN_PID=$!
wait "$TRAIN_PID"
