import seaborn as seaborn
import matplotlib.pyplot as plot
import numpy as np
import os
import enum
from typing import Literal

cur_dir = os.path.dirname(__file__)

seaborn.set_style("whitegrid")
seaborn.set_context("paper")

sensorDict = {
    "NPPN": 0,
    "PNNP": 1,
    "PNDD": 2,
    "PDDN": 3,
    "PN": 4
}
moistureDict = {
    "dry": 0,
    "wet": 1
}
r1Dict = {
    "10":  10,
    "1k":  1000,
    "10k": 10000,
    "1M":  1000000
}
r2Dict = {
    "100M": 100000000 # 100M = no resistor
}
c1Dict = {
    "2pF":   0.000000000002,
    "150pF": 0.00000000015,
    "10nF":  0.00000001,
    "1uF":   0.000001,
    "100uF": 0.0001
}

KEY = Literal[
    'sensor',
    'moisture_key',
    'moisture',
    'r1_key',
    'r1',
    'r2_key',
    'r2',
    'c1_key'
    'c1',
    'frequency',
    'duty_cycle',
    'measurement_wet',
    'stabilization_time_wet',
    'success_wet',
    'measurement_dry',
    'stabilization_time_dry',
    'success_dry',
    'difference',
    'stabilization_time_avg'
]

ATT_11 = 1
ATT_6 = 1750/2450
ATT_2_5 = 1250/2450
ATT_0 = 950/2450


dataDict = {}
measurementDictWet = {}
measurementDictDry = {}
stabilizationDictWet = {}
stabilizationDictDry = {}

for moistureKey in moistureDict:
    for r1Key in r1Dict:
        for r2Key in r2Dict:
            for c1Key in c1Dict:
                # Read data.csv (frequency,duty_cycle,measurement,stabilization_time)
                file = moistureKey + '-' + r1Key + '-' + r2Key + '-' + c1Key + '.csv'
                file = os.path.join(cur_dir, file)
                with open(file, 'r') as f:
                    if os.stat(file).st_size == 0:
                        continue
                                
                data = np.genfromtxt(file, delimiter=';', skip_header=1, dtype=None)
                # add to dataDict
                for row in data:
                    _, frequency, duty_cycle, measurement, stabilization_time, success = row
                    sensor_name: str = row[0].decode('utf-8')
                    key = "S: {:4s} | R1: {:4s} | R2: {:4s} | C1: {:5s} | Freq: {:7d} | Duty: {:3d}".format(sensor_name, r1Key, r2Key, c1Key, frequency, duty_cycle)
                    if key not in dataDict:
                        dataDict[key] = {
                            'sensor': row[0].decode('utf-8'),
                            'moisture_key': moistureKey,
                            'moisture': moistureDict[moistureKey],
                            'r1_key': r1Key,
                            'r1': r1Dict[r1Key],
                            'r2_key': r2Key,
                            'r2': r2Dict[r2Key],
                            'c1_key': c1Key,
                            'c1': c1Dict[c1Key],
                            'frequency': row[1],
                            'duty_cycle': row[2],
                        }
                    
                    if (moistureKey == "wet"):
                        dataDict[key]['measurement_wet'] = row[3]
                        dataDict[key]['stabilization_time_wet'] = row[4]
                        dataDict[key]['success_wet'] = row[5]
                    else:
                        dataDict[key]['measurement_dry'] = row[3]
                        dataDict[key]['stabilization_time_dry'] = row[4]
                        dataDict[key]['success_dry'] = row[5]

# remove all keys where data is missing
for key in list(dataDict):
    if not 'measurement_wet' in dataDict[key] or not 'measurement_dry' in dataDict[key] or not 'stabilization_time_wet' in dataDict[key] or 'not stabilization_time_dry' in dataDict[key]:
        del dataDict[key]


for key in dataDict:
    dataDict[key]['difference'] = dataDict[key]['measurement_dry'] - dataDict[key]['measurement_wet']

for key in dataDict:
    dataDict[key]['stabilization_time_avg'] = (dataDict[key]['stabilization_time_dry'] + dataDict[key]['stabilization_time_wet']) / 2

def save_data_csv(dataDict, filename):
    return
    with open(os.path.join(cur_dir, filename), 'w') as f:
        f.write("sensor;moisture_key;r1_key;r1;r2_key;r2;c1_key;c1;frequency;duty_cycle;measurement_wet;stabilization_time_wet;success_wet;measurement_dry;stabilization_time_dry;success_dry;difference;stabilization_time_avg\n")
        for key in dataDict:
            f.write("{};{};{};{};{};{};{};{};{};{};{};{};{};{};{};{};{};{}\n".format(
                dataDict[key]['sensor'],
                dataDict[key]['moisture_key'],
                dataDict[key]['r1_key'],
                dataDict[key]['r1'],
                dataDict[key]['r2_key'],
                dataDict[key]['r2'],
                dataDict[key]['c1_key'],
                dataDict[key]['c1'],
                dataDict[key]['frequency'],
                dataDict[key]['duty_cycle'],
                dataDict[key]['measurement_wet'],
                dataDict[key]['stabilization_time_wet'],
                dataDict[key]['success_wet'],
                dataDict[key]['measurement_dry'],
                dataDict[key]['stabilization_time_dry'],
                dataDict[key]['success_dry'],
                dataDict[key]['difference'],
                dataDict[key]['stabilization_time_avg']
            ).replace('.', ','))

save_data_csv(dataDict, 'data.csv')

for key in list(dataDict):
    if dataDict[key]['measurement_wet'] < 50 or dataDict[key]['measurement_dry'] >= 4050 or dataDict[key]['success_wet'] == 0 or dataDict[key]['success_dry'] == 0:
        del dataDict[key]

save_data_csv(dataDict, 'data_cleaned.csv')

for key in dataDict:
    stabilization_time_weight = 0.2
    difference_weight = 0.6
    difference_height_weight = 0.2
    difference_score = difference_weight * (dataDict[key]['difference'] / dataDict[key]['measurement_dry'])
    difference_height_score = difference_height_weight * (dataDict[key]['difference'] / 4096)
    stabilization_score = stabilization_time_weight * (1 - dataDict[key]['stabilization_time_avg'] / 500)
    dataDict[key]['score'] = difference_score + stabilization_score + difference_height_score

# for key in list(dataDict):
#     if dataDict[key]['measurement_dry'] > ATT_0 * 4096:
#         del dataDict[key]

sortedByScore = sorted(dataDict.items(), key=lambda x: x[1]['score'], reverse=True)[:50]
# reverse sortedByDifference
sortedByScore.reverse()
print("best by score")
print(" sensor         R1         R2         C1            Freq           Duty   => difference = measurementDry - measurementWet => stabilization score")
print("------------------------------------------------------------------------------------------------------------------------------------------------")
keys = []
for item in sortedByScore:
    print("{:73s} =>    {:4d}    =      {:4d}      -      {:4d}      =>      {:4d}      {:1.2f}".format(item[0], int(item[1]["difference"]), int(item[1]["measurement_dry"]), int(item[1]["measurement_wet"]), int(item[1]["stabilization_time_avg"]), item[1]["score"]))
    keys.append(item[0])

# print freq and duty_cycle min and max
maxDatas = []
for key in keys:
    data = dataDict[key]
    maxDatas.append(data)

maxDatas = sorted(maxDatas, key=lambda x: x['frequency'], reverse=True)
print("frequency : {} - {}".format(maxDatas[-1]["frequency"], maxDatas[0]["frequency"]))
maxDatas = sorted(maxDatas, key=lambda x: x['duty_cycle'], reverse=True)
print("duty_cycle: {} - {}".format(maxDatas[-1]["duty_cycle"], maxDatas[0]["duty_cycle"]))

# print most common r1, r2 and c1 with average score
r1s_sum = {}
r2s_sum = {}
c1s_sum = {}
sensors_sum = {}
r1s_avg = {}
r2s_avg = {}
c1s_avg = {}
sensors_avg = {}
for key in keys:
    data = dataDict[key]
    if data['r1_key'] not in r1s_sum:
        r1s_sum[data['r1_key']] = 0
        r1s_avg[data['r1_key']] = 0
    if data['r2_key'] not in r2s_sum:
        r2s_sum[data['r2_key']] = 0
        r2s_avg[data['r2_key']] = 0
    if data['c1_key'] not in c1s_sum:
        c1s_sum[data['c1_key']] = 0
        c1s_avg[data['c1_key']] = 0
    if data['sensor'] not in sensors_sum:
        sensors_sum[data['sensor']] = 0
        sensors_avg[data['sensor']] = 0
    r1s_sum[data['r1_key']] += data['score']
    r2s_sum[data['r2_key']] += data['score']
    c1s_sum[data['c1_key']] += data['score']
    sensors_sum[data['sensor']] += data['score']
    r1s_avg[data['r1_key']] += 1
    r2s_avg[data['r2_key']] += 1
    c1s_avg[data['c1_key']] += 1
    sensors_avg[data['sensor']] += 1

for key in r1s_sum:
    r1s_avg[key] = r1s_sum[key] / r1s_avg[key]
for key in r2s_sum:
    r2s_avg[key] = r2s_sum[key] / r2s_avg[key]
for key in c1s_sum:
    c1s_avg[key] = c1s_sum[key] / c1s_avg[key]
for key in sensors_sum:
    sensors_avg[key] = sensors_sum[key] / sensors_avg[key]

r1s = sorted(r1s_sum.items(), key=lambda x: x[1], reverse=True)
r2s = sorted(r2s_sum.items(), key=lambda x: x[1], reverse=True)
c1s = sorted(c1s_sum.items(), key=lambda x: x[1], reverse=True)
sensors = sorted(sensors_sum.items(), key=lambda x: x[1], reverse=True)




print("r1s: {}".format(r1s))
# print("r2s: {}".format(r2s))
print("c1s: {}".format(c1s))
print("sensors: {}".format(sensors))

exit()

def plot2D(keyX: KEY, keyY: KEY, ax, keyFilter: KEY=None, filter=None, log=False, color='blue', alpha=1, offset_x=9):
    x = []
    y = []
    for key in dataDict:
        if keyFilter != None and dataDict[key][keyFilter] != filter:
            continue
        data = dataDict[key]
        if offset_x == 0:
            x.append(data[keyX])
        else:
            x.append(data[keyX] * (1 + offset_x))
        y.append(data[keyY])
        
    if log:
        ax.set_xscale('log')
        ax.set_yscale('log')
    ax.scatter(x, y, color=color, alpha=alpha)
    ax.set_xlabel(keyX)
    ax.set_ylabel(keyY)
    ax.set_title("{} - {}".format(keyX, keyY))

def plot3D(keyX: KEY, keyY: KEY, keyZ: KEY, ax, log=False, dotSize=10, filterKey: KEY=None, filter=None):
    x = []
    y = []
    z = []
    for key in dataDict:
        if filterKey != None and dataDict[key][filterKey] != filter:
            continue
        data = dataDict[key]
        x.append(data[keyX])
        y.append(data[keyY])
        z.append(data[keyZ])
        
    if log:
        ax.set_xscale('log')
        ax.set_yscale('log')
    ax.scatter(x, y, c=z, cmap='viridis', s=dotSize)
    ax.set_xlabel(keyX)
    ax.set_ylabel(keyY)
    ax.set_title("{} - {} - {}: {}".format(keyX, keyY, keyZ, filter))
    # show colormap
    plot.colorbar(ax.scatter(x, y, c=z, cmap='viridis', s=dotSize), ax=ax)

def plot2DHistogram(keyX: KEY, keyFilter: KEY, filter, ax, color, alpha=1):
    # calculate buckets of size 100
    buckets = {}
    count = 0
    for key in dataDict:
        data = dataDict[key]
        if keyFilter != None and data[keyFilter] != filter:
            continue
        count += 1
        bucket = int(data[keyX] / 100) * 100
        if bucket not in buckets:
            buckets[bucket] = []
        buckets[bucket].append(data[keyX])

    # x: bucket, y: count
    x = []
    y = []
    for bucket in buckets:
        x.append(bucket)
        y.append(len(buckets[bucket]) / count)

    ax.bar(x, y, width=100, color=color, alpha=alpha)
    ax.set_xlabel(keyX)
    ax.set_ylabel('count')
    ax.set_title("{} - count: {}".format(keyX, filter))

# def plot2DBarChart(keyX, keyY, ax):
    

# create 2x3 subplots
fig, ((ax1, ax2, ax3, ax4, ax5), (ax7, ax8, ax9, ax10, ax11)) = plot.subplots(2, 5, figsize=(20, 6))

# plot2DHistogram('difference', 'sensor', "NPPN", ax1, 'red', 0.2)
# plot2DHistogram('difference', 'sensor', "PNNP", ax1, 'green', 0.2)
# plot2DHistogram('difference', 'sensor', "PNDD", ax1, 'blue', 0.2)
# plot2DHistogram('difference', 'sensor', "PDDN", ax1, 'yellow', 0.2)
# plot2DHistogram('difference', 'sensor', "PN", ax1, 'black', 0.2)

# plot2DHistogram('difference', 'sensor', "NPPN", ax2, 'red')
# plot2DHistogram('difference', 'sensor', "PNNP", ax3, 'green')
# plot2DHistogram('difference', 'sensor', "PNDD", ax4, 'blue')
# plot2DHistogram('difference', 'sensor', "PDDN", ax5, 'yellow')
# plot2DHistogram('difference', 'sensor', "PN", ax6, 'black')

plot3D('duty_cycle', 'difference', 'frequency', ax1, True, 150, filterKey='sensor', filter="NPPN")
plot3D('duty_cycle', 'difference', 'frequency', ax2, True, 150, filterKey='sensor', filter="PNNP")
plot3D('duty_cycle', 'difference', 'frequency', ax3, True, 150, filterKey='sensor', filter="PNDD")
plot3D('duty_cycle', 'difference', 'frequency', ax4, True, 150, filterKey='sensor', filter="PDDN")
plot3D('duty_cycle', 'difference', 'frequency', ax5, True, 150, filterKey='sensor', filter="PN")

plot3D('r1', 'c1', 'difference', ax7, True, 150, filterKey='sensor', filter="NPPN")
plot3D('r1', 'c1', 'difference', ax8, True, 150, filterKey='sensor', filter="PNNP")
plot3D('r1', 'c1', 'difference', ax9, True, 150, filterKey='sensor', filter="PNDD")
plot3D('r1', 'c1', 'difference', ax10, True, 150, filterKey='sensor', filter="PDDN")
plot3D('r1', 'c1', 'difference', ax11, True, 150, filterKey='sensor', filter="PN")

# plot3D('frequency', 'duty_cycle', 'stabilization_time_avg', ax1, True, 150, filterKey='sensor', filter="NPPN")
# plot3D('frequency', 'duty_cycle', 'stabilization_time_avg', ax2, True, 150, filterKey='sensor', filter="PNNP")
# plot3D('frequency', 'duty_cycle', 'stabilization_time_avg', ax3, True, 150, filterKey='sensor', filter="PNDD")
# plot3D('frequency', 'duty_cycle', 'stabilization_time_avg', ax4, True, 150, filterKey='sensor', filter="PDDN")
# plot3D('frequency', 'duty_cycle', 'stabilization_time_avg', ax5, True, 150, filterKey='sensor', filter="PN")

# plot3D('r1', 'c1', 'stabilization_time_avg', ax7, True, 150, filterKey='sensor', filter="NPPN")
# plot3D('r1', 'c1', 'stabilization_time_avg', ax8, True, 150, filterKey='sensor', filter="PNNP")
# plot3D('r1', 'c1', 'stabilization_time_avg', ax9, True, 150, filterKey='sensor', filter="PNDD")
# plot3D('r1', 'c1', 'stabilization_time_avg', ax10, True, 150, filterKey='sensor', filter="PDDN")
# plot3D('r1', 'c1', 'stabilization_time_avg', ax11, True, 150, filterKey='sensor', filter="PN")


# plot3D('duty_cycle', 'c1', 'difference', ax2, True, 300)
# plot3D('frequency', 'r1', 'difference', ax3, True, 300)
# plot3D('frequency', 'c1', 'difference', ax4, True, 300)
# plot2D('r1', 'difference', ax5, True)
# plot2D('r1', 'stabilization_time_avg', ax5, True)
# plot3D('frequency', 'duty_cycle', 'stabilization_time_avg', ax6, True, 300)

# plot2D("r1", "difference", ax5, "sensor", "NPPN", True, 'red', 1, 0)
# plot2D("r1", "difference", ax5, "sensor", "PNNP", True, 'green', 1, 0.4)
# plot2D("r1", "difference", ax5, "sensor", "PNDD", True, 'blue', 1, 0.8)
# plot2D("r1", "difference", ax5, "sensor", "PDDN", True, 'yellow', 1, 1.2)
# plot2D("r1", "difference", ax5, "sensor", "PN", True, 'black', 1, 1.6)

# plot2D("c1", "difference", ax6, "sensor", "NPPN", True, 'red', 1, 0)
# plot2D("c1", "difference", ax6, "sensor", "PNNP", True, 'green', 1, 0.4)
# plot2D("c1", "difference", ax6, "sensor", "PNDD", True, 'blue', 1, 0.8)
# plot2D("c1", "difference", ax6, "sensor", "PDDN", True, 'yellow', 1, 1.2)
# plot2D("c1", "difference", ax6, "sensor", "PN", True, 'black', 1, 1.6)


fig.tight_layout()
plot.show()
