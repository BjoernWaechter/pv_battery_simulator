import moment from "moment";
import * as d3 from "d3";
import { SetStateAction } from "react";


const battery_maxs = [0, 5, 10, 15];
const price_in = 0.30;
const price_out = 0.08;

type RawData = {
  date: number;
  name: string;
  value: number | null;
};

export type CleanedRawData = {
  date: number;
  human_day: string;
  raw_month: string;
  iso_month: string;
  raw_day: string;
  in: number | null;
  out: number | null;
};

export type AggData = {
  date: number;
  human_day: string;
  // raw_day: string;
  in_sum: number | null;
  out_sum: number | null;
};

export type BatteryData = {
  date: number;
  human_day: string;
  // raw_day: string;
  soc5: number | null;
  soc10: number | null;
  soc15: number | null;
};

const in_data: RawData[] = [];
const out_data: RawData[] = [];

export const new_raw: CleanedRawData[] = [{
  date: 0,
  human_day: "2024-01-01",
  raw_month: "2024-01",
  iso_month: "2024-01-01",
  raw_day: "2024-01-01",
  in: 0,
  out: 0,
},
{
date: 1,
human_day: "2024-02-01",
raw_month: "2024-02",
iso_month: "2024-02-01",
raw_day: "2024-02-01",
in: 10,
out: 10,
}];

export const daily_agg: AggData[] = [
  {
    date: 0,
    human_day: "2024-01-01",
    // raw_day: string; 
    in_sum: 0, 
    out_sum: 0
    }
];


export const battery_soc: BatteryData[] = [
  {
    date: 0,
    human_day: "2024-01-01",
    soc5: 0,
    soc10: 0,
    soc15: 0
    }
];

const fmt_iso_day = d3.timeFormat("%Y-%m-%dT00:00:00Z");
const fmt_iso_month = d3.timeFormat("%Y-%m-01T00:00:00Z");
export const fmt_human_day = d3.timeFormat("%Y-%m-%d");
const time_fmt_human = d3.timeFormat("%Y-%m-%d %H:%M");

const fmt_raw_month = d3.timeFormat("%Y%m");

function hasValidDate(element: RawData, _index: number, _array: RawData[]) {
  return !isNaN(element.date);
}


function round_digit(num: number | null, digit: number) {
  if (num == null) {
    return null;
  } else {
    return Math.round(num * Math.pow(10, digit)) / Math.pow(10, digit);
  }
}

function agg_values(
  a: number | null,
  b: number | null,
  func: (x: number, y: number) => number
): number | null {
  if ((a == null || isNaN(a)) && (b == null || isNaN(b)) == null) {
    return null;
  } else if (a == null || isNaN(a)) {
    return b;
  } else if (b == null || isNaN(b)) {
    return a;
  } else {
    return func(a, b);
  }
}

function merge_data(
  setRawData, setAggData, setBatteryData,
  msgSetter
) {
  const all_data = in_data.concat(out_data);
  const data_sorted = all_data
    .filter(hasValidDate)
    .sort((a: { date: number }, b: { date: number }) => a.date - b.date);

  let prev_date = 0;
  let prev_iso_day = "";
  let prev_iso_month = "";

  let in_day_min: number | null = null;
  let in_day_max: number | null = null;
  let out_day_min: number | null = null;
  let out_day_max: number | null = null;

  new_raw.splice(0, new_raw.length);
  daily_agg.splice(0, daily_agg.length);
  battery_soc.splice(0, battery_soc.length);


  console.log(`in size: ${in_data.length} out size: ${out_data.length} `)

  const battery = new Array<number>(battery_maxs.length).fill(0);
  const new_cost_sum = new Array<number>(battery_maxs.length).fill(0);

  let prev_in: number | null = null;
  let prev_out: number | null = null;


  // data_sorted.map((val, index: number) => {
  for (const val of data_sorted) {
    const ts = new Date(val.date);
    // console.log("date diff: "+(val.date - prev_date))

    if (prev_date > val.date) {
      console.log("#################### ERROR ##################");
      msgSetter["error"](
        "Time sort error: " + typeof prev_date + "-" + typeof val.date
      );
    }
    // prev_date = val.date
    if (!isNaN(ts.getTime()) && !isNaN(val.value || NaN)) {
      const iso_day = fmt_iso_day(ts);
      const iso_month = fmt_iso_month(ts);

      const in_val = val.name == "in" ? val.value : null;
      const out_val = val.name == "out" ? val.value : null;

      if (iso_month != prev_iso_month) {
        const iso_month_date = new Date(iso_month);
        new_raw.push({
          date: moment(iso_month_date).valueOf(),
          human_day: fmt_human_day(iso_month_date),
          raw_month: fmt_raw_month(iso_month_date),
          iso_month: iso_month,
          raw_day: fmt_iso_day(iso_month_date),
          in: null,
          out: null,
        });
      }

      const last_idx = new_raw.length - 1;
      // Merge in and out at the same date into one record
      if (prev_date == val.date && last_idx > 0) {
        if (val.name == "in") {
          new_raw[last_idx].in = val.value;
        } else {
          new_raw[last_idx].out = val.value;
        }
      } else {
        new_raw.push({
          date: moment(ts).valueOf(),
          human_day: fmt_human_day(ts),
          raw_month: fmt_raw_month(ts),
          iso_month: fmt_iso_month(ts),
          raw_day: iso_day,
          in: in_val,
          out: out_val,
        });
      }

      const in_diff = round_digit(
        in_day_max != null && in_day_min != null
          ? in_day_max - in_day_min
          : null,
        2
      );
      const out_diff = round_digit(
        out_day_max != null && out_day_min != null
          ? out_day_max - out_day_min
          : null,
        2
      );

      const human_date = new Date(prev_iso_day);

      if (
        prev_iso_day != iso_day &&
        prev_iso_day != "" &&
        moment(prev_date).valueOf() != null &&
        !isNaN(moment(prev_date).valueOf()) &&
        ((in_diff && in_diff > 0) || (out_diff && out_diff > 0))
      ) {
        
        // console.log("day: " + prev_iso_day + " in_diff: " + in_diff + " out_diff: " + out_diff)

        const agg_data: AggData = {
          date: moment(prev_date).valueOf(),
          human_day: fmt_human_day(human_date),
          // raw_day: prev_iso_day,
          in_sum: in_diff,
          out_sum: out_diff,
        };

        daily_agg.push(agg_data);

        in_day_min = null;
        in_day_max = null;
        out_day_min = null;
        out_day_max = null;
      }

      in_day_min = agg_values(in_day_min, in_val, Math.min);
      in_day_max = agg_values(in_day_max, in_val, Math.max);

      out_day_min = agg_values(out_day_min, out_val, Math.min);
      out_day_max = agg_values(out_day_max, out_val, Math.max);



      // Handle battery data

      let diff = 0;
      if (in_val && prev_in) {
        diff = -(in_val-prev_in);
      } else if (out_val && prev_out) {
        diff = out_val-prev_out;
      }

      const new_diff = new Array<number>(battery_maxs.length).fill(0);
      const new_cost = new Array<number>(battery_maxs.length).fill(0);

      for(let bat_idx=0; bat_idx<battery_maxs.length; bat_idx++){
        const battery_max = battery_maxs[bat_idx];
        if (diff > 0) 
        {
            // #org_cost = -diff*price_out
            // # All to battery
            if (battery[bat_idx]+diff <= battery_max)
            {
                battery[bat_idx] = battery[bat_idx] + diff
                new_diff[bat_idx] = 0
            }
            // # Partly to battery
            else if  (battery[bat_idx]+diff >= battery_max)
            {
                new_diff[bat_idx] = diff-(battery_max-battery[bat_idx])
                battery[bat_idx] = battery_max
            }
            else
            {
              throw new Error("unexpected")
            }
        }
        else if (diff <= 0) {
          
            // #org_cost = -diff*price_in
            // # All power from battery
            if (battery[bat_idx]+diff >= 0)
            {
                battery[bat_idx] = battery[bat_idx] + diff
                new_diff[bat_idx] = 0
            }
            else if (battery[bat_idx]+diff < 0)
            {
                new_diff[bat_idx] = battery[bat_idx]+diff
                battery[bat_idx] = 0
            }
            else
            {
              throw new Error("unexpected")
            }
        }
      }

      const battery_data: BatteryData = {
        date: moment(ts).valueOf(),
        human_day: fmt_human_day(ts),
        // raw_day: prev_iso_day,
        soc5: round_digit(battery[1],3),
        soc10: round_digit(battery[2],3),
        soc15: round_digit(battery[3],3)
      };
    
      battery_soc.push(battery_data);

      for(let bat_idx=0; bat_idx<battery_maxs.length; bat_idx++)
      {
        if (new_diff[bat_idx] >= 0)
        {
          new_cost[bat_idx] = -new_diff[bat_idx]*price_out
        }
        else
        {
          new_cost[bat_idx] = -new_diff[bat_idx]*price_in
        }

        // #print(f"{t=} {new_diff[idx]=} - {new_cost[idx]=} {price_in=}")

        new_cost_sum[bat_idx] = new_cost_sum[bat_idx] + new_cost[bat_idx]
      }

      prev_date = val.date;
      prev_iso_day = iso_day;
      prev_iso_month = iso_month;

      if (in_val) {
        prev_in = in_val;
      }

      if (out_val) {
        prev_out = out_val;
      }
    }
  }

  let resultText = "";
  for(let bat_idx=0; bat_idx<battery_maxs.length; bat_idx++)
    resultText += "Price "+battery_maxs[bat_idx]+" kwh "+round_digit(new_cost_sum[bat_idx],2) + "€\n"

  if (prev_in && prev_out)
  {
    // setresultMessage(resultText);
    msgSetter["result"](resultText);
  }

  let importMsg = "";
  if (prev_in)
  {
    importMsg += "\u2705 Input energy data is monotonically increasing\n"
  }
  else
  {
    importMsg += "\u2754 Input energy data ...\n"
  }

  if (prev_out)
  {
    importMsg += "\u2705 Output energy data is monotonically increasing"
  }
  else
  {
    importMsg += "\u2754 Output energy data ..."
  }

  

  msgSetter["import"](importMsg)

  setRawData(new_raw.slice());
  setAggData(daily_agg.slice());
  setBatteryData(battery_soc.slice());
}

export function import_raw_csv(
  // eslint-disable-next-line
  results: any,
  input_type: string,
  setRawData, 
  setAggData,
  setBatteryData,
  msgSetter
) 
{
  if (input_type == "in")
  {
    in_data.splice(0, in_data.length);
  }
  else if (input_type == "out")
  {
    out_data.splice(0, out_data.length);
  }

  // eslint-disable-next-line
  results.data.forEach((element: any[]) => {
    const ts = new Date(element[2]);
    const new_row = {
      date: moment(ts).valueOf(),
      name: input_type,
      value: round_digit(element[1], 2),
    }
    if (input_type == "in")
    {
      in_data.push(new_row);
    }
    else if (input_type == "out")
    {
      out_data.push(new_row);
    }
  });
  merge_data(setRawData, setAggData, setBatteryData, msgSetter);
}
