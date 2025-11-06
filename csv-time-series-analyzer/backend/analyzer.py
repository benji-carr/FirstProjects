import sys
import pandas as pd
import statsmodels.api as sm
from arch import arch_model

# Args: file, model, time_column, value_column
file, model, time_col, value_col = sys.argv[1:5]

df = pd.read_csv(file)
series = df[value_col]

if model == "ARIMA":
    model = sm.tsa.ARIMA(series, order=(1, 1, 1))
    results = model.fit()
    print("Model training complete.")
elif model == "SARIMA":
    model = sm.tsa.statespace.SARIMAX(series, order=(1, 1, 1), seasonal_order=(1,1,1,12))
    results = model.fit()
    print("Model training complete.")
elif model == "GARCH":
    model = arch_model(series, vol="Garch", p=1, q=1)
    results = model.fit(disp="off")
    print("Model training complete.")
else:
    print("Unknown model")
