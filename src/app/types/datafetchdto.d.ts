interface DataFechTrack {
  id: "",
  peopleid: "",
  name: "",
  type: "",
  zone: 0,
  time: "",
  facesnapshot: ""
}

interface DataFechPeople {
  id: "",
  name: "",
  role: "",
  embeddingface: "",
  facestraight: ""
}

interface DataFechCheckIn {
  id: "",
  name: "",
  role: "",
  checkin: "",
  checkout: "",
  imageface: "",
  status: ""
}

interface DataFetchWoringTime {
  actual_working_hours: number | string;
  increase_actual_working_hours: number;
  work_performance: number | string;
  increase_work_performance: number;
  over_time_hours: number | string;
  increase_over_time_hours: number;
  over_time_percent: number | string;
  graph_data: WorkingTimeDataPoint[]
}

interface WorkingTimeDataPoint {
  month: string;
  averageHours: number;
  overtime: number;
}