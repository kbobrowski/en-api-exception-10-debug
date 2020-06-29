import matplotlib.pyplot as plt
from glob import glob
import numpy as np

time_intervals = []
time_log = []
exceptions_for_time_interval = []

log_paths = glob("calls_with_intervals_log/*.txt")
for path in log_paths:
    with open(path) as f:
        log_lines = f.readlines()
    exponent = int(path.split("/")[1][:-4])
    api_exception_count = 0
    for line in log_lines:
        if "ApiException" in line:
            api_exception_count += 1
    time_intervals.append(2**exponent)
    time_log.append(exponent)
    exceptions_for_time_interval.append(api_exception_count)

A = np.vstack([time_log, np.ones(len(time_log))]).T

m, c = np.linalg.lstsq(A, exceptions_for_time_interval)[0]


x_int = np.linspace(1, 4096*2, 1000)
y_int = m * np.log2(x_int) + c
print(f"{m} * log2(delay) + {c}")

plt.scatter(time_intervals, exceptions_for_time_interval)
plt.plot(x_int, y_int)
plt.grid()
plt.xscale("log")
plt.xlabel("delay between calls to provideDiagnosisKeys [ms]")
plt.ylabel("number of ApiException(10) in 20 calls")
plt.plot()
plt.show()


