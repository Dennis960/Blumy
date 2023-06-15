import type { ApexOptions } from 'apexcharts';
import dateFormat from 'dateformat';

function valueToDateString(value: number | string, _timestamp?: number, _opts?: any) {
  let date = new Date(value);
  // if date is today, show time only
  if (dateFormat(date, 'dd.mm.yyyy') == dateFormat(new Date(), 'dd.mm.yyyy')) {
    return dateFormat(date, 'HH:MM') + ' Uhr';
  }
  // else show date and time
  return dateFormat(date, 'dd.mm HH:MM') + ' Uhr';
}

/**
 * Deeply spreads objects into each other.
 */
function deepSpreadObjects<T extends Object>(o1: T, o2: T): T {
  let out = {} as T;
  for (let key of [...Object.keys(o1), ...Object.keys(o2)] as (keyof T)[]) {
    if (typeof o1[key] == 'object' && typeof o2[key] == 'object') {
      out[key] = deepSpreadObjects(o1[key] as Object, o2[key] as Object) as T[keyof T];
    } else if (typeof o1[key] == 'object') {
      out[key] = o1[key];
    } else if (typeof o2[key] == 'object') {
      out[key] = o2[key];
    } else {
      out[key] = o2[key] ?? o1[key];
    }
  }
  return out;
}

export function deepSpread<T extends Object>(...arr: T[]): T {
  let out = {} as T;
  for (let o of arr) {
    out = deepSpreadObjects(out, o);
  }
  return out;
}

export const defaultGraphOptions: ApexOptions = {
  chart: {
    type: 'area',
    toolbar: {
      show: false
    },
    height: '100%',
    width: '99%',
    animations: {
      enabled: false
    }
  },
  tooltip: {
    x: {
      formatter: valueToDateString
    },
    theme: 'dark',
    followCursor: false,
    enabledOnSeries: [0],
  },
  dataLabels: {
    enabled: false
  },
  legend: {
    labels: {
      colors: 'var(--primary)'
    },
    horizontalAlign: 'left',
    showForZeroSeries: false
  },
  grid: {
    show: true,
    borderColor: 'var(--grid-color)',
    position: 'back',
    xaxis: {
      lines: {
        show: true
      }
    },
    yaxis: {
      lines: {
        show: true
      }
    }
  },
  stroke: {
    curve: 'straight',
    width: 1
  },
  xaxis: {
    type: 'datetime',
    labels: {
      formatter: valueToDateString,
      style: {
        colors: 'var(--primary)'
      }
    }
  },
  yaxis: {
    labels: {
      formatter(val) {
        return Math.round(val).toString();
      },
      style: {
        colors: 'var(--primary)'
      }
    },
    forceNiceScale: true
  },
  annotations: {
    yaxis: [
      {
        y: 0,
      }
    ]
  }
}

export type ChartData = {
  x: Date;
  y: number;
};