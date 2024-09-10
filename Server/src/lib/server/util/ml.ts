export function exponentialRegression(data: number[][]) {
	const sum = [0, 0, 0, 0, 0, 0];

	for (let n = 0; n < data.length; n++) {
		sum[0] += data[n][0];
		sum[1] += data[n][1];
		sum[2] += data[n][0] * data[n][0] * data[n][1];
		sum[3] += data[n][1] * Math.log(data[n][1]);
		sum[4] += data[n][0] * data[n][1] * Math.log(data[n][1]);
		sum[5] += data[n][0] * data[n][1];
	}

	const denominator = sum[1] * sum[2] - sum[5] * sum[5];
	const a = Math.exp((sum[2] * sum[3] - sum[5] * sum[4]) / denominator);
	const b = (sum[1] * sum[4] - sum[5] * sum[3]) / denominator;

	return {
		a,
		b
	};
}

interface DataEntry {
	timestamp: Date;
	value: number;
}
export function calculateDerivative(data: DataEntry[]) {
	const derivativeData: DataEntry[] = [];

	for (let i = 1; i < data.length; i++) {
		const currentData = data[i];
		const previousData = data[i - 1];

		const timeDifference = currentData.timestamp.getTime() - previousData.timestamp.getTime();
		const waterDifference = currentData.value - previousData.value;

		const derivative = waterDifference / timeDifference;

		const derivativeObject: DataEntry = {
			timestamp: currentData.timestamp,
			value: derivative
		};

		derivativeData.push(derivativeObject);
	}

	return derivativeData;
}
