"use client";
import React, { useState, useEffect } from "react";
import { FiChevronDown, } from "react-icons/fi";
import { FaChevronLeft, FaChevronRight, FaEye } from "react-icons/fa";
import { CiImageOff } from "react-icons/ci";
import Dialog from '../../../components/Dialog';
import useSWR from 'swr'
import { ToastContainer, Zoom, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { io } from 'socket.io-client';

export default function TrackTime() {
  const [selectedGate, setSelectedGate] = useState('0');
  const [error, setError] = useState('');
  const [selectedDateStart, setSelectedDateStart] = useState(new Date().toISOString().split("T")[0]);
  const [selectedDateEnd, setSelectedDateEnd] = useState(new Date().toISOString().split("T")[0]);

  const [idTrackDetail, setIdTrackDetail] = useState("");

  const [pageIndex, setPageIndex] = useState(1);
  const [perPage, setPerPage] = useState(8);

  const [isDialogOpenDelePeople, setIsDialogOpenDelePeople] = useState(false);

  const handleDetail = (id: string) => {
    setIsDialogOpenDelePeople(true)
    setIdTrackDetail(id)
  };

  const GetListTrack = (url: string) => fetch(url).then(res => res.json()).then(data => {
    const usersWithBinaryData = data.tracks.map((data: DataFechTrack) => ({
      id: data.id,
      peopleid: data.peopleid,
      name: data.name,
      type: data.type,
      zone: data.zone,
      time: data.time,
      imageUrl: `data:image/jpeg;base64,${data.facesnapshot}`
    }));
    data.tracks = usersWithBinaryData;
    // console.log(data);
    return data;
  });

  const { data: pageTracks, error: errorListTracks, mutate: mutateDataTracks, isLoading: loadListTracks } = useSWR<IPageTrack>(
    selectedDateStart != '' && selectedDateEnd != ''
    ? `http://127.0.0.1:5000/tracks/${pageIndex}/${perPage}/${selectedGate}/${selectedDateStart}/${selectedDateEnd}`
    : `http://127.0.0.1:5000/tracks/${pageIndex}/${perPage}/${selectedGate}/${new Date().toISOString().split("T")[0]}/${new Date().toISOString().split("T")[0]}`,
    GetListTrack);

    const GetUniqueZone = (url: string) => fetch(url).then(res => res.json()).then(data => {
      return data.unique_zones;
    });
  
    const { data: uniqueZone, error: errorUniqueZone, mutate: mutateUniqueZone, isLoading: loadUniqueZone } = useSWR<string[]>(
      `http://127.0.0.1:5000/unique_zones`,
      GetUniqueZone, {
    });

  const toastSuccesShow = (string: string) => {
    toast(string, {
      type: "success",
      position: "bottom-right",
      isLoading: false,
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      transition: Zoom,
    });
  }

  const socket = io('http://localhost:5000');
  
  useEffect(() => {
    socket.on('response', (data) => {      
      console.log(data);
      mutateDataTracks();
      mutateUniqueZone();
      toastSuccesShow("Phát hiện có người mới ở cổng " + (data.zone + 1));
    });

    return () => {
      socket.off('response');
    };
  }, [pageTracks, perPage, mutateDataTracks, mutateUniqueZone]);

  const getIdPeople = (id: string): string => {
    const track = pageTracks?.tracks?.find((p) => p.id === id);
    return track ? track.peopleid : '';
  };

  const GetImageById = (url: string) => fetch(url).then(res => res.json()).then(data => {
    return `data:image/jpeg;base64,${data.image}`;
  });

  const { data: imageById, error: errorImageById, isLoading: loadImageById } = useSWR<string>(
    idTrackDetail != "" ?
      `http://127.0.0.1:5000/imagebyid/${getIdPeople(idTrackDetail)}` : null,
    GetImageById, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });
  
  const handleDateChangeStart = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDateStart(event.target.value);
  };

  const handleDateChangeEnd = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDateEnd(event.target.value);
  };

  const convertDateString = (dateString: string) => {    
    const date = new Date(dateString);
    
    const day = date.getUTCDate();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); 
    const year = String(date.getUTCFullYear()).padStart(2, '0');
    const hours = date.getUTCHours();
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');

    const adjustedHours = (hours < 0) ? (24 + hours) : (hours % 24);

    return `${String(adjustedHours).padStart(2, '0')}:${minutes}:${seconds}  ${day}-${month}-${year}`;
  };

  const handlePageChange = async (page: number) => {
    if (page > 0 && pageTracks?.pages !== undefined && page <= pageTracks.pages) {
      setPageIndex(page);
    }
  };

  const handleGateChange = (gate: string) => {
    try {
      setSelectedGate(gate);  
      setPageIndex(1)    
    } catch (err) {
      setError("Error changing gate. Please try again.");
    }
  };

  const getNameById = (id: string): string => {
    const track = pageTracks?.tracks?.find((p) => p.id === id);
    return track ? track.name : '';
  };

  const getTimeById = (id: string): string => {
    const track = pageTracks?.tracks?.find((p) => p.id === id);
    return track ? convertDateString(track.time) : '';
  };

  const getImageSnapShotById = (id: string): string => {
    const track = pageTracks?.tracks?.find((p) => p.id === id);
    return track ? track.imageUrl : '';
  };

  if (loadListTracks || !pageTracks?.tracks) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-20 h-20 rounded-full animate-spin border-y-8 border-solid border-indigo-500 border-t-transparent shadow-md"></div>
      </div>
    )
  }

  return (
    <div className="mx-auto p-4 2xl:px-40 xl:px-20 lg:px-10 md:px-10 sm:px-10">
      <div className="bg-white p-6 rounded-3xl shadow-2xl">
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md" role="alert">
            {error}
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
          <div className="relative w-full md:w-64">
            <select
              value={selectedGate}
              onChange={(e) => handleGateChange(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 appearance-none"
              aria-label="Select gate"
            >
              {uniqueZone?.map((gate: string) => (
                <option key={gate} value={gate}>
                  Cổng {gate + 1}
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute right-2.5 top-3.5 text-gray-500" />
          </div>
          <div className="flex items-center ">
            <span className="mx-4">Từ</span>
            <div className="flex justify-between">
              <input
                type="date"
                value={selectedDateStart}
                onChange={handleDateChangeStart}
                max={selectedDateEnd}
                className="border rounded-lg px-4 py-2"
              />
            </div>
            <span className="mx-4">Đến</span>
            <div className="flex justify-between">
              <input
                type="date"
                value={selectedDateEnd}
                min={selectedDateStart}
                onChange={handleDateChangeEnd}
                className="border rounded-lg px-4 py-2"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto mb-5">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Tên</th>
                <th scope="col" className="px-6 py-3">Ảnh</th>
                <th scope="col" className="px-6 py-3">Thời gian</th>
                <th scope="col" className="px-6 py-3">Kiểu</th>
                <th scope="col" className="px-6 py-3">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {pageTracks?.tracks.map((record) => (
                <tr
                  key={record.id}
                  className="bg-white border-b hover:bg-gray-200 transition-colors duration-200"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {record.name}
                  </td>
                  <td className="px-6 py-4">
                    <img
                      src={record.imageUrl}
                      alt={record.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  </td>
                  <td className="px-6 py-4">{convertDateString(record.time)}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.type === "entry" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      {record.type}
                    </span>
                  </td>
                  <td
                    className="px-6 py-4"
                  ><button
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    onClick={() => handleDetail(record.id)}
                  >
                      <FaEye className="inline mr-2" /> Xem
                    </button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between bg-white">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              disabled={pageTracks.current_page <= 1}
              onClick={() => handlePageChange(pageTracks.current_page - 1)}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              disabled={pageTracks.current_page >= pageTracks.pages}
              onClick={() => handlePageChange(pageTracks.current_page + 1)}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Page <span className="font-medium">{pageTracks.current_page}</span> of <span className="font-medium">{pageTracks.pages}</span>
              </p>
            </div>
            <div>
              <nav aria-label="Pagination" className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                <button
                  onClick={() => handlePageChange(pageTracks.current_page - 1)}
                  disabled={pageTracks.current_page <= 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-200 focus:z-20 focus:outline-offset-0"
                >
                  <span className="sr-only">Previous</span>
                  <FaChevronLeft aria-hidden="true" className="h-4 w-4" />
                </button>

                {
                  pageTracks.pages == 0 ? (
                    <button
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold 
                          'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-200 hover:text-gray-700'
                          focus:z-20 focus:outline-offset-0`}
                    >
                      1
                    </button>
                  ) :
                    (
                      Array.from({ length: pageTracks.pages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${page === pageTracks.current_page
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-200 hover:text-gray-700'
                            } focus:z-20 focus:outline-offset-0`}
                        >
                          {page}
                        </button>
                      ))
                    )
                }

                <button
                  onClick={() => handlePageChange(pageTracks.current_page + 1)}
                  disabled={pageTracks.current_page >= pageTracks.pages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-200 focus:z-20 focus:outline-offset-0"
                >
                  <span className="sr-only">Next</span>
                  <FaChevronRight aria-hidden="true" className="h-4 w-4" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        theme="light"
        transition={Zoom}
      />

      <Dialog
        isOpen={isDialogOpenDelePeople}
        onClose={() => {
          setIsDialogOpenDelePeople(false)
          setIdTrackDetail("")
        }}
        title="Thông tin chi tiết"
        buttonClose={true}
      >
        <div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-900">
              Tên
            </label>
            <div className="mt-1 p-2 bg-gray-50 rounded-md">
              <p className="text-sm font-semibold leading-6 text-gray-900">{getNameById(idTrackDetail)}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900">
              Thời gian
            </label>
            <div className="mt-1 p-2 bg-gray-50 rounded-md">
              <p className="text-sm font-semibold leading-6 text-gray-900">{getTimeById(idTrackDetail)}</p>
            </div>
          </div>
          <div className="flex justify-center items-center gap-4">
            <div>
              <p className="text-sm font-semibold leading-6 text-gray-600">Ảnh gốc</p>
              {imageById ? (
                <img src={imageById} alt="Ảnh gốc" className="w-72 h-auto rounded-lg shadow-md" />
              ) : (
                <CiImageOff className="w-64 h-auto rounded-lg shadow-md" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold leading-6 text-gray-600">Ảnh chụp nhanh</p>
              <img src={getImageSnapShotById(idTrackDetail)} alt="Ảnh 2" className="w-72 h-auto rounded-lg shadow-md" />
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  )
}