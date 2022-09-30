import type { NextPage } from 'next';
import { useState } from 'react';
import { Chart } from "react-google-charts";
import dayjs from 'dayjs';

const LogTimeline: NextPage = () => {
  const initialData = [
    [
      { type: "string", id: "President" },
      { type: "string", id: "dummy bar label" },
      { type: "string", role: "tooltip" },
      { type: "date", id: "Start" },
      { type: "date", id: "End" },
    ],
    ["Washington", null, "George", new Date(1789, 3, 29), new Date(1797, 2, 3)],
    ["Adams", null, "John", new Date(1797, 2, 3), new Date(1801, 2, 3)],
    ["Jefferson", null, "Thomas", new Date(1801, 2, 3), new Date(1809, 2, 3)],
  ];

  const [data, setData] = useState(initialData);

  const handleChange = (e) => {
    const lines = JSON.parse(e.target.value);
    console.log(lines);
    const header = [
      {type: 'string', id: 'ip'},
      {type: 'string', id: 'code'},
      {type: 'string', id: 'verbose', role: 'tooltip'},
      {type: 'date', id: 'Start'},
      {type: 'date', id: 'End'},
    ]

    const newData = lines.reduce((acc, line) => {
      const processingTime = parseInt(line.target_processing_time) > 0 ? parseInt(line.target_processing_time) : 0;
      return [
        ...acc,
        [
          line.target_ip,
          line.elb_status_code,
          `${dayjs(line.time).format('YYYY-MM-DD HH:mm:ss')},  ${line.target_processing_time}, ${dayjs(line.time).add(parseInt(line.target_processing_time), 'second').format('YYYY-MM-DD HH:mm:ss')}, ${line.recieved_bytes}, ${line.request_verb}, ${line.request_url}`,
          dayjs(line.time).unix(),
          dayjs(line.time).add(processingTime, 'minutes').unix(),
        ]
      ]

    }, [header])

    console.log(newData);
    

    setData(newData)
  }

  const options = {
    allowHtml: true,
    avoidOverlappingGridLines: false,
    width: 1800,
    height: 500,
  };

  const convertRecords = () => {

  }

  return (
    <>
      <div>
        Paste Logs(Json Lines Format)
        <br />
        <textarea onChange={handleChange} rows={10} cols={150}>
        </textarea>
        <Chart
      chartType="Timeline"
      data={data}
      width="100%"
      height="400px"
      options={options}
    />
      </div>
    </>
  )
}

export default LogTimeline;