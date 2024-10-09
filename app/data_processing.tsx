import moment from 'moment';
import * as d3 from 'd3'
import { SetStateAction } from 'react';

type RawData = {
    date: number, 
    name: string, 
    value: number | null
};


export type CleanedRawData = {
    date: number,
    human_day: string,
    raw_month: string,
    iso_month: string,
    raw_day: string,
    in: number | null,
    out: number | null,
}

export type AggData = { 
    date: number; 
    human_day: string; 
    // raw_day: string; 
    in_sum: number | null; 
    out_sum: number | null; 
};
  
const in_data: RawData[] = []
const out_data: RawData[] = []

const fmt_iso_day   = d3.timeFormat('%Y-%m-%dT00:00:00Z')
const fmt_iso_month = d3.timeFormat('%Y-%m-01T00:00:00Z')
export const fmt_human_day = d3.timeFormat('%Y-%m-%d')
const time_fmt_human = d3.timeFormat('%Y-%m-%d %H:%M')

const fmt_raw_month = d3.timeFormat('%Y%m')

function hasValidDate(element: RawData, _index:number, _array:RawData[]) { 
    return !isNaN(element.date); 
} 

function round_digit(num: number | null, digit: number)
{
  if (num == null)
  {
    return null
  }
  else
  {
    return Math.round(num * Math.pow(10,digit)) / Math.pow(10,digit)
  }
}

function agg_values(a:number|null, b:number|null, func: (x: number, y: number) => number ) : number|null
  {
    if ( (a == null || isNaN(a)) && (b == null || isNaN(b)) == null)
    {
      return null
    }
    else if (a == null || isNaN(a))
    {
      return b
    }
    else if (b == null || isNaN(b))
    {
      return a
    }
    else
    {
      return func(a, b)
    }
  }


function merge_data(
    in_data: RawData[], 
    out_data: RawData[],
    fn_update_raw: { (value: SetStateAction<CleanedRawData[]>): void; (value: SetStateAction<CleanedRawData[]>): void; }, 
    fn_update_agg: { (value: SetStateAction<AggData[]>): void; (value: SetStateAction<AggData[]>): void; },
    setErrorMessage: (msg: string) => void
) 
{

    const all_data = in_data.concat(out_data)
    const data_sorted = all_data.filter(hasValidDate).sort((a: { date: number; }, b: { date: number; }) => (a.date - b.date));
    
    const new_raw:CleanedRawData[] = []
    const daily_agg = []

    let prev_date = 0
    let prev_iso_day = ""
    let prev_iso_month = ""

    let in_day_min:number|null = null
    let in_day_max:number|null = null
    let out_day_min:number|null = null
    let out_day_max:number|null = null

    // data_sorted.map((val, index: number) => {
    for (const val of data_sorted)
    {
        
        const ts = new Date(val.date)
        // console.log("date diff: "+(val.date - prev_date))

        if (prev_date > val.date)
        {
        console.log("#################### ERROR ##################")
        setErrorMessage('Time sort error: ' + typeof(prev_date) + "-" + typeof(val.date));
        }
        // prev_date = val.date
        if(!isNaN(ts.getTime()) && !isNaN(val.value || NaN))
        {

        const iso_day = fmt_iso_day(ts)
        const iso_month = fmt_iso_month(ts)

        const in_val  = val.name == "in"  ? val.value : null
        const out_val = val.name == "out" ? val.value : null

        if (iso_month != prev_iso_month)
        {
            const iso_month_date = new Date(iso_month)
            new_raw.push(
            {
                date: moment(iso_month_date).valueOf(),
                human_day: fmt_human_day(iso_month_date),
                raw_month: fmt_raw_month(iso_month_date),
                iso_month: iso_month,
                raw_day: fmt_iso_day(iso_month_date),
                in: null,
                out: null,
            }
            )
        }

        const last_idx = new_raw.length-1
        // Merge in and out at the same date into one record
        if (prev_date == val.date && last_idx > 0)
        {
            if (val.name == "in")
            {
                new_raw[last_idx].in = val.value
            }
            else
            {
                new_raw[last_idx].out = val.value
            }
        }
        else 
        {
            
            new_raw.push(
                {
                    date: moment(ts).valueOf(),
                    human_day: fmt_human_day(ts),
                    raw_month: fmt_raw_month(ts),
                    iso_month: fmt_iso_month(ts),
                    raw_day: iso_day,
                    in: in_val,
                    out: out_val,
                }
            )
        }

        const in_diff =  round_digit(in_day_max  != null && in_day_min  != null ? in_day_max-in_day_min : null, 2)
        const out_diff = round_digit(out_day_max != null && out_day_min != null ? out_day_max-out_day_min : null, 2)

        if (
            prev_iso_day != iso_day && 
            prev_iso_day != "" && 
            moment(prev_date).valueOf() != null && !isNaN(moment(prev_date).valueOf()) 
            && ((in_diff && in_diff > 0) || ( out_diff && out_diff > 0)))
        {
            const prev_date = new Date(prev_iso_day)
            // console.log("day: " + prev_iso_day + " in_diff: " + in_diff + " out_diff: " + out_diff)

            const agg_data: AggData = {
                date: moment(prev_date).valueOf(),
                human_day: fmt_human_day(prev_date),
                // raw_day: prev_iso_day,
                in_sum:  in_diff,
                out_sum: out_diff,
            }

            daily_agg.push(agg_data)

            in_day_min = null
            in_day_max = null
            out_day_min = null
            out_day_max = null
        }

        in_day_min = agg_values(in_day_min, in_val, Math.min)
        in_day_max = agg_values(in_day_max, in_val, Math.max)

        out_day_min = agg_values(out_day_min, out_val, Math.min)
        out_day_max = agg_values(out_day_max, out_val, Math.max)

        
        prev_date = val.date
        prev_iso_day = iso_day
        prev_iso_month = iso_month
        }
    }

    // setRawData(new_raw);
    // setAggData(daily_agg);
    for (const val of new_raw)
    {
        console.log("ts: "+time_fmt_human(new Date(val.date))+" in: " +val.in + " out: "+val.out)
    }

    fn_update_raw(new_raw);
    fn_update_agg(daily_agg);
}

export function import_raw_csv(
// eslint-disable-next-line
    results: any, 
    input_type: string, 
    fn_update_raw: { (value: SetStateAction<CleanedRawData[]>): void; (value: SetStateAction<CleanedRawData[]>): void; }, 
    fn_update_agg: { (value: SetStateAction<AggData[]>): void; (value: SetStateAction<AggData[]>): void; },
    setErrorMessage: (msg: string) => void
)
{

    out_data.splice(0, out_data.length);

// eslint-disable-next-line
    results.data.forEach( (element: any[]) => {
      const ts = new Date(element[2])
      in_data.push(
        {
          date: moment(ts).valueOf(),
          name: input_type,
          value: round_digit(element[1],2)
        }
      )

    });
    merge_data(in_data, out_data, fn_update_raw, fn_update_agg, setErrorMessage);
    
}