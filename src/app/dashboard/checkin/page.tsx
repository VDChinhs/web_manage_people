"use client";
import React, { useState } from 'react';
import { FiClock, FiAlertCircle } from 'react-icons/fi';
import 'react-datepicker/dist/react-datepicker.css';
import useSWR from 'swr'

const EmployeeCheckInList: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const GetListCheckIn = (url: string) => fetch(url).then(res => res.json()).then(data => {
    const usersData = data.map((data: DataFechCheckIn) => ({
      id: data.id,
      name: data.name,
      role: data.role,
      checkin: data.checkin,
      checkout: data.checkout,
      imageface: `data:image/jpeg;base64,${data.imageface}`,
      status: data.status
    }));
    return usersData;
  });

  const { data: listCheckIn, error: errorListCheckIn, mutate: mutateDataCheckIn, isLoading: loadListCheckIn } = useSWR<DataFechCheckIn[]>(
    `http://127.0.0.1:5000/checkinbyday/${selectedDate}`,
    GetListCheckIn);

  const handleDateChangeStart = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);    
    mutateDataCheckIn();
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case "checked in":
        return "text-green-600";
      case "checked out":
        return "text-green-600";
      case "not checked in":
        return "text-red-600";
      case "not checked out":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getTimeColor = (time: string): string => {
    if (time == '-') {
      return "text-red-600";
    }
    else {
      return "text-green-600";
    }
  };

  const convertDateString = (dateString: string) => {
    if (dateString == '-') return '-';
    const date = new Date(dateString);

    const hours = date.getUTCHours();
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');

    const adjustedHours = (hours < 0) ? (24 + hours) : (hours % 24);

    return `${String(adjustedHours).padStart(2, '0')}:${minutes}:${seconds}`;
  };

  if (errorListCheckIn) {
    return (
      <div className="flex items-center justify-center p-4 bg-red-50 rounded-lg" role="alert">
        <FiAlertCircle className="w-6 h-6 text-red-500 mr-2" />
        <span className="text-red-700">Có lỗi xảy ra</span>
      </div>
    );
  }

  if (loadListCheckIn || !listCheckIn) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-20 h-20 rounded-full animate-spin border-y-8 border-solid border-indigo-500 border-t-transparent shadow-md"></div>
      </div>
    )
  }

  return (
    <div className="mx-auto p-4 2xl:px-40 xl:px-20 lg:px-10 md:px-10 sm:px-10">
      <div className="bg-white p-6 rounded-3xl shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Danh sách chấm công nhân viên</h1>
        <div className="relative">
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChangeStart}
            className="border rounded-lg px-4 py-2"
          />
        </div>
      </div>

      <div className="overflow-x-auto mb-5">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Nhân viên</th>
              <th scope="col" className="px-6 py-3">Vai trò</th>
              <th scope="col" className="px-6 py-3">Check In</th>
              <th scope="col" className="px-6 py-3">Check Out</th>
              <th scope="col" className="px-6 py-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {listCheckIn?.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      src={entry.imageface}
                      alt={'avatar'}
                      className="w-10 h-10 rounded-full object-cover mr-3"
                    />
                    <div className="text-sm font-medium text-gray-900">{entry.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {entry.role}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className={`flex items-center ${getTimeColor(entry.checkin)}`}>
                    <FiClock className="w-4 h-4 mr-2" />
                    {convertDateString(entry.checkin)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className={`flex items-center ${getTimeColor(entry.checkout)}`}>
                    <FiClock className="w-4 h-4 mr-2" />
                    {convertDateString(entry.checkout)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-medium ${getStatusColor(entry.status)}`}>
                    {entry.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
};
export default EmployeeCheckInList;