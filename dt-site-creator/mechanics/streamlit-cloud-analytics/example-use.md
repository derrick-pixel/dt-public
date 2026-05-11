# Example use — market-tracker and yishun-dorm-pitch

Two live Streamlit Cloud apps in the Elitez fleet:

## market-tracker
- Public Streamlit Cloud app, light theme, ChicagoBooth analysis.
- Includes a guest rate-limiter pattern to prevent abuse of free public access.
- Deployed via derrick-pixel/markettracker repo connection.

## yishun-dorm-pitch
- Streamlit pitch app for AB Associates / Yishun factory-converted dorm co-investment.
- SFA-restricted (Elitez HQ employees only via Streamlit's "specific Streamlit accounts" gate).
- Deployed at yishun.streamlit.app.

## What's distinct about Streamlit Cloud vs FlyIO + FastAPI

You give up: real backend logic, REST APIs, multi-tenant DB rows.

You get: data-driven UI in 200 lines of Python, deploy in 5 minutes.

The choice between Streamlit Cloud and the FastAPI+Fly stack is mostly: "is this app fundamentally a data dashboard, or fundamentally an application with multiple user flows?"
