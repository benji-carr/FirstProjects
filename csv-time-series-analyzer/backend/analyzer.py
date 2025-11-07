import sys
import pandas as pd
import statsmodels.api as sm
from arch import arch_model

file, model, time_col, value_col = sys.argv[1:5]

print(f"Loading {file}", flush=True)
df = pd.read_csv(file)
print(f"Columns: {df.columns.tolist()}", flush=True)
df[time_col] = pd.to_datetime(df[time_col], errors="coerce")
df = df.set_index(time_col).sort_index()
series = df[value_col].dropna().iloc[-200:]
print(f"Series length: {len(series)}", flush=True)

try:
    if model == "ARIMA":
        print("Fitting ARIMA...", flush=True)
        fit = sm.tsa.ARIMA(series, order=(1, 1, 1)).fit()
    elif model == "SARIMA":
        print("Fitting SARIMA...", flush=True)
        fit = sm.tsa.statespace.SARIMAX(series, order=(1, 1, 1),
                                        seasonal_order=(1, 1, 1, 12)).fit(disp=False)
    elif model == "GARCH":
        print("Fitting GARCH...", flush=True)
        fit = arch_model(series, vol="Garch", p=1, q=1).fit(disp="off")
    else:
        print("Unknown model", flush=True)
        sys.exit(1)

    print("Model training complete.", flush=True)
    summary_text = fit.summary().as_text()
    print(summary_text[:5000], flush=True)

except Exception as e:
    print(f"Error: {str(e)}", flush=True)
    sys.exit(1)
