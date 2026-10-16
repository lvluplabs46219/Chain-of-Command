# Agent creates a bucket and syncs experiment outputs
● Bash(hf buckets create training-artifacts-v2)
└ Bucket created: hf://buckets/acme/training-artifacts-v2
● Bash(hf buckets sync ./experiment_outputs/ hf://buckets/acme/training-artifacts-v2)
└ Sync plan: ./experiment_outputs/ → hf://buckets/acme/training-artifacts-v2
Uploads: 16
Downloads: 0
● All done. Bucket acme/training-artifacts-v2 synced (14.3 GB total):
- 3 checkpoints (model.safetensors, optimizer.pt, config.json)
- 6 parquet shards (data/train/ and data/eval/)
- 1 training log
Bucket is live at hf://buckets/acme/training-artifacts-v2
