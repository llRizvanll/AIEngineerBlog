from ray import serve
from starlette.requests import Request
from vllm import LLM, SamplingParams


@serve.deployment(
    ray_actor_options={"num_gpus": 1},
    autoscaling_config={"min_replicas": 2, "max_replicas": 20, "target_ongoing_requests": 16},
    max_ongoing_requests=32,
    health_check_period_s=10,
)
class Generator:
    def __init__(self, model: str):
        self.llm = LLM(model=model)

    def check_health(self) -> None:
        self.llm.generate(["ping"], SamplingParams(max_tokens=1))

    async def __call__(self, request: Request) -> dict:
        body = await request.json()
        output = self.llm.generate([body["prompt"]], SamplingParams(max_tokens=body.get("max_tokens", 256)))
        return {"text": output[0].outputs[0].text}


app = Generator.bind(model="meta-llama/Llama-3.1-8B-Instruct")
