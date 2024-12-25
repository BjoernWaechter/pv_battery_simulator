export type BatteryData = {
  date: number | null;
  soc5: number | null;
  soc10: number | null;
  soc15: number | null;
};

export const init_battery_data: BatteryData[] = [
    {
        date: 0,
        soc5: 0,
        soc10: 0,
        soc15: 0
    }
];



export type AggData = {
  date: number | null;
  in_sum: number | null;
  out_sum: number | null;
};

export const init_agg_data: AggData[] = [
    {
        date: 0,
        in_sum: 0, 
        out_sum: 0
    }
];



export type CleanedRawData = {
  date: number | null;
  human_day: string | null;
  raw_month: string | null;
  iso_month: string | null;
  raw_day: string | null;
  in: number | null;
  out: number | null;
};

export const init_cleaned_raw: CleanedRawData[] = [{
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