'use client'

import React, { CSSProperties, useState } from 'react';
import { AxisOptions, Chart } from "react-charts";

import { useCSVReader } from 'react-papaparse';

 type MyDatum = { date: Date, stars: number }

 const styles = {
  csvReader: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 10,
  } as CSSProperties,
  browseFile: {
    width: '20%',
  } as CSSProperties,
  acceptedFile: {
    border: '1px solid #ccc', 
    height: 45,
    lineHeight: 2.5,
    paddingLeft: 10,
    width: '80%',
  } as CSSProperties,
  remove: {
    borderRadius: 0,
    padding: '0 20px',
  } as CSSProperties,
  progressBarBackgroundColor: {
    backgroundColor: 'red',
  } as CSSProperties,
};

 export default function   MyChart() {
  
  const { CSVReader } = useCSVReader();

  type DailyStars = {
    date: Date,
    stars: number,
  }
 
  
  type Series = {
    label: string,
    data: DailyStars[]
  }
  
  const data2: Series[] = [
    {
      label: 'Incoming',
      data: [
        {
          date: new Date('1995-12-17T03:24:00'),
          stars: 5,
        },
        {
          date: new Date('1995-12-17T03:25:00'),
          stars: 6,
        },
        {
          date: new Date('1995-12-17T03:26:00'),
          stars: 7,
        }
        // ...
      ]
    }
  ]

  const data3: Series[] = [
    {
      label: 'Incoming',
      data: [
        {
          date: new Date('1995-12-17T03:24:00'),
          stars: 15,
        }
        // ...
      ]
    }
  ]

  const [data, setData] = useState(data2)

  const primaryAxis = React.useMemo(
    (): AxisOptions<DailyStars> => ({
      getValue: datum => datum.date,
    }),
    []
  )



  const secondaryAxes = React.useMemo(
    (): AxisOptions<DailyStars>[] => [
      {
        getValue: datum => datum.stars,
      },
    ],
    []
  )

   return (
    <>
    <CSVReader
      onUploadAccepted={(results: any) => {
        console.log('---------------------------');
        console.log(results);
        console.log('---------------------------');
        const raw_data = []
        results.data.forEach( (element) => {
          
          const ts = new Date(element[2])
          console.log(ts);
          raw_data.push({
            date: new Date(element[2]),
            stars: Math.round(element[1]),
          })
        });
        const data_new: Series[] = [
          {
            label: 'Incoming',
            data: raw_data
          }
        ]
        setData(data_new);
      }}
    >
      {({
        getRootProps,
        acceptedFile,
        ProgressBar,
        getRemoveFileProps,
      }: any) => (
        <>
          <div style={styles.csvReader}>
            <button type='button' {...getRootProps()} style={styles.browseFile}>
              Browse file
            </button>
            <div style={styles.acceptedFile}>
              {acceptedFile && acceptedFile.name}
            </div>
            <button {...getRemoveFileProps()} style={styles.remove}>
              Remove
            </button>
          </div>
          <ProgressBar style={styles.progressBarBackgroundColor} />
        </>
      )}
    </CSVReader>
    <div style={{height:"60vh",position:"relative", marginBottom:"1%", padding:"1%"}}>
     <Chart
       options={{
        data,
        primaryAxis,
        secondaryAxes
      }}
     />
    </div>
    </>
   )

 }