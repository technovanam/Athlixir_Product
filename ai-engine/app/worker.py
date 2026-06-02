import os
import json
import redis
from app.api.analyze import run_analysis_pipeline

def main():
    redis_host = os.environ.get("REDIS_HOST", "localhost")
    redis_port = int(os.environ.get("REDIS_PORT", 6379))
    redis_client = redis.Redis(host=redis_host, port=redis_port, db=0)

    print("Worker is listening for jobs on 'analysis-jobs' queue...")

    while True:
        try:
            # LPOP blocks until a job is available
            _, job_data_str = redis_client.blpop("bullmq:analysis-jobs:waiting")
            if job_data_str:
                job_data = json.loads(job_data_str)
                job_id = job_data.get("id")
                print(f"Processing job: {job_id}")

                # The actual data is in the 'data' key, which is a JSON string
                payload = json.loads(job_data.get("data", "{}"))

                analysis_id = payload.get("analysisId")
                video_url = payload.get("videoUrl")
                user_id = payload.get("userId")
                athlete_context = payload.get("athleteContext")
                previous_metrics = payload.get("previousMetrics")

                if all([analysis_id, video_url, user_id]):
                    run_analysis_pipeline(
                        analysis_id,
                        video_url,
                        user_id,
                        athlete_context,
                        previous_metrics
                    )
                else:
                    print("Job data is missing required fields.")

        except redis.exceptions.ConnectionError as e:
            print(f"Redis connection error: {e}")
            # Optional: Add a sleep before retrying
        except Exception as e:
            print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    main()
