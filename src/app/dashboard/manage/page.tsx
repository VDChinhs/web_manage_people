"use client";
import React, { useState, FormEvent } from "react";
import { FaSearch, FaPlus, FaEdit, FaTrash, FaChevronRight, FaChevronLeft } from "react-icons/fa";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import Dialog from '../../../components/Dialog';
import { TbPhoto } from "react-icons/tb";
import useSWR from 'swr';
import { ToastContainer, Zoom, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Poisition {
  id: string;
  title: string;
}

const DailyAttendanceManager = () => {

  let toastId;
  const [searchTerm, setSearchTerm] = useState("");
  const [idPeopleDele, setIdPeopleDele] = useState("");
  const [idPeopleUpdate, setIdPeopleUpdate] = useState("");

  const [isDialogOpenAddPeople, setIsDialogOpenAddPeople] = useState(false);
  const [isDialogOpenUpdatePeople, setIsDialogOpenUpdatePeople] = useState(false);
  const [isDialogOpenDelePeople, setIsDialogOpenDelePeople] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [perPage, setPerPage] = useState(9);

  const [isChangedImage, setChangedImage] = useState(false);

  const positions: Poisition[] = [
    { id: "1", title: "Lập trình viên phần mềm" },
    { id: "2", title: "Quản trị hệ thống" },
    { id: "3", title: "Kỹ sư AI" },
    { id: "4", title: "HR" },
  ];

  const [formDataAddPeople, setFormDataAddPeople] = useState({
    name: "",
    role: "",
    pictureface: "",
  });

  function getTokenCookie() {
    const name = "token=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookies = decodedCookie.split(';');

    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.indexOf(name) === 0) {
        return cookie.substring(name.length, cookie.length);
      }
    }

    return null;
  }

  const toastSuccesShow = (string: string, toastId: string) => {
    toast.update(toastId, {
      render: string,
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

  const toastErrorShow = (string: string, toastId: string) => {
    toast.update(toastId, {
      render: string,
      type: "error",
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

  const GetListPeople = (url: string) => fetch(url).then(res => res.json()).then(data => {
    const listpeoples = data.peoples.map((data: DataFechPeople) => ({
      id: data.id,
      name: data.name,
      role: data.role,
      embeddingface: data.embeddingface,
      facestraight: data.facestraight,
      imageUrl: `data:image/jpeg;base64,${data.facestraight}`
    }));
    data.peoples = listpeoples;
    // console.log(data);
    return data;
  });

  const { data: pagePeoples, error: errorListPeoples, mutate: mutateListPeoples, isLoading: loadListPeoples } = useSWR<IPagePeople>(
    `http://127.0.0.1:5000/peoples/${pageIndex}/${perPage}`,
    GetListPeople)

  const filteredUsers = pagePeoples?.peoples?.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchAddPeople = async () => {
    const token = getTokenCookie();

    toastId = toast.loading('Processing...');
    const formData = new FormData();
    formData.append('straight_photo', base64ToBlob(formDataAddPeople.pictureface), 'image.jpg');
    formData.append('name', formDataAddPeople.name);
    formData.append('role', formDataAddPeople.role);
    try {
      const response = await fetch('http://127.0.0.1:5000/add_people', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      if (response.ok) {
        const result = await response.json();
        console.log('Add thành công:', result);
        mutateListPeoples()
        toastSuccesShow(result.message, toastId as string);

      } else {
        const result = await response.json();
        toastErrorShow(result.message, toastId as string);
      }
    } catch (error) {
      console.error('Lỗi khi gửi ảnh:', error);
    }
  }

  const fetchUpdatePeople = async () => {
    const token = localStorage.getItem('token');

    toastId = (toast.loading('Processing...'));
    const formData = new FormData();
    formData.append('id', idPeopleUpdate);
    formData.append('name', formDataAddPeople.name);
    formData.append('role', formDataAddPeople.role);
    formData.append('imagechanged', isChangedImage.toString());
    formData.append('straight_photo', base64ToBlob(formDataAddPeople.pictureface), 'image.jpg');
    try {
      const response = await fetch('http://127.0.0.1:5000/update_people', {
        method: 'PUT',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Update thành công:', result);
        mutateListPeoples()
        toastSuccesShow(result.message, toastId as string);
      } else {
        const result = await response.json();
        toastErrorShow(result.message, toastId as string);
      }
    } catch (error) {
      console.error('Lỗi khi gửi ảnh:', error);
    }
  }

  const fetchDelePeople = async () => {
    if (pagePeoples?.peoples.length === 1 && pageIndex > 1) {
      setPageIndex(pageIndex - 1);
    }

    const token = getTokenCookie();
    toastId = (toast.loading('Processing...'));
    const formData = new FormData();
    formData.append('id', idPeopleDele);
    try {
      const response = await fetch('http://127.0.0.1:5000/delete_people', {
        method: 'DELETE',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Dele thành công:', result);
        mutateListPeoples()
        toastSuccesShow(result.message, toastId as string);
        console.log('Dele thành công:', result);
      } else {
        const result = await response.json();
        toastErrorShow(result.message, toastId as string);
      }
    } catch (error) {
      console.error('Lỗi khi gửi ảnh:', error);
    }
  }

  const handleAddPeople = () => {
    handleRemoveImage()
    setIsDialogOpenAddPeople(true)
    setChangedImage(false)
    setFormDataAddPeople({
      name: '',
      role: 'Vip1',
      pictureface: ''
    })
  };

  const handleUpdatePeople = (userId: string) => {
    setFormDataAddPeople({
      name: getNameById(userId),
      role: getRoleById(userId),
      pictureface: getImageById(userId)
    })
    setIdPeopleUpdate(userId)
    setIsDialogOpenUpdatePeople(true)
    setChangedImage(false)
  };

  const handleDeletePeople = (userId: string) => {
    setIdPeopleDele(userId)
    setIsDialogOpenDelePeople(true)
  };

  const handleSubmitAddPeople = (e: FormEvent) => {
    e.preventDefault();
    if (formDataAddPeople.name != '' && formDataAddPeople.pictureface != '') {
      setFormDataAddPeople({
        name: "",
        role: "Vip1",
        pictureface: ""
      });
      console.log(formDataAddPeople);
      fetchAddPeople()
      setIsDialogOpenAddPeople(false)
    }
    else {
      alert("Thiếu thông tin");
    }
  };

  const handleSubmitUpdatePeople = (e: FormEvent) => {
    e.preventDefault();
    console.log(formDataAddPeople);

    if (formDataAddPeople.name != '' && formDataAddPeople.pictureface != '') {
      setFormDataAddPeople({
        name: "",
        role: "",
        pictureface: ""
      });
      fetchUpdatePeople()
      setIsDialogOpenUpdatePeople(false)
    }
    else {
      alert("Thiếu thông tin");
    }
  };

  const handleSubmitDelePeople = () => {
    fetchDelePeople()
    setIdPeopleDele('')
    setIsDialogOpenDelePeople(false)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleClickCloseModel: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    setChangedImage(false)
    setIsDialogOpenAddPeople(false)
    setIsDialogOpenUpdatePeople(false)
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormDataAddPeople({ ...formDataAddPeople, [name]: value });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormDataAddPeople({ ...formDataAddPeople, [name]: value });
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChangedImage(true)
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormDataAddPeople({ ...formDataAddPeople, ['pictureface']: reader.result as string })
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormDataAddPeople({ ...formDataAddPeople, ['pictureface']: '' })
  };

  function base64ToBlob(base64: string, contentType = "",
    sliceSize = 512) {
    const byteCharacters = atob(base64?.split(",")[1]);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length;
      offset += sliceSize) {
      const slice = byteCharacters.slice(
        offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  };

  const getNameById = (id: string): string => {
    const person = pagePeoples?.peoples?.find((p) => p.id === id);
    return person ? person.name : '';
  };

  const getRoleById = (id: string): string => {
    const person = pagePeoples?.peoples?.find((p) => p.id === id);
    return person ? person.role : '';
  };

  const getImageById = (id: string): string => {
    const person = pagePeoples?.peoples?.find((p) => p.id === id);
    return person ? person.imageUrl : '';
  };

  const handlePageChange = (page: number) => {
    if (page > 0 && pagePeoples?.pages !== undefined && page <= pagePeoples.pages) {
      setPageIndex(page);
    }
  };

  if (loadListPeoples || !pagePeoples?.peoples) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-20 h-20 rounded-full animate-spin border-y-8 border-solid border-indigo-500 border-t-transparent shadow-md"></div>
      </div>
    )
  }

  return (
    <div className="mx-auto p-4 2xl:px-40 xl:px-20 lg:px-10 md:px-10 sm:px-10">
      <div className="bg-white p-6 rounded-3xl shadow-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users"
              className="pl-10 pr-4 py-2 border rounded-lg"
              value={searchTerm}
              onChange={handleSearch}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-lg"
            onClick={handleAddPeople}
          >
            <FaPlus className="inline mr-2" /> Add User
          </button>
        </div>
        {
          pagePeoples.pages == 0 ? (
            <div className="text-center my-3">
              <a>Không có dữ liệu</a>
            </div>
          ) : (
            <ul role="list" className="divide-y divide-gray-100">
              {filteredUsers?.map((person) => (
                <li key={person.id} className="flex justify-between my-6">
                  <div className="flex min-w-0 gap-x-4">
                    <img alt="" src={person.imageUrl} className="h-12 w-12 flex-none rounded-full bg-gray-50" />
                    <div className="min-w-0 flex-auto">
                      <p className="text-sm font-semibold leading-6 text-gray-900">{person.name}</p>
                      <p className="mt-1 truncate text-xs leading-5 text-gray-500">{person.role}</p>
                    </div>
                  </div>
                  <div className="flex min-w-0 gap-x-3">
                    <button
                      className="text-blue-500 mr-2 hover:text-blue-700"
                      onClick={() => handleUpdatePeople(person.id)}
                    >
                      <FaEdit className="text-xl" />
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDeletePeople(person.id)}
                    >
                      <FaTrash className="text-xl" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

          )
        }

        <div className="flex items-center justify-between border-t border-gray-200 bg-white pt-5">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              disabled={pagePeoples.current_page <= 1}
              onClick={() => handlePageChange(pagePeoples.current_page - 1)}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              disabled={pagePeoples.current_page >= pagePeoples.pages}
              onClick={() => handlePageChange(pagePeoples.current_page + 1)}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Page <span className="font-medium">{pagePeoples.current_page}</span> of <span className="font-medium">{pagePeoples.pages}</span>
              </p>
            </div>
            <div>
              <nav aria-label="Pagination" className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                <button
                  onClick={() => handlePageChange(pagePeoples.current_page - 1)}
                  disabled={pagePeoples.current_page <= 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-200 focus:z-20 focus:outline-offset-0"
                >
                  <span className="sr-only">Previous</span>
                  <FaChevronLeft aria-hidden="true" className="h-4 w-4" />
                </button>

                {
                  pagePeoples.pages == 0 ? (
                    <button
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold 
                          'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-200 hover:text-gray-700'
                          focus:z-20 focus:outline-offset-0`}
                    >
                      1
                    </button>
                  ) :
                    (
                      Array.from({ length: pagePeoples.pages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${page === pagePeoples.current_page
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
                  onClick={() => handlePageChange(pagePeoples.current_page + 1)}
                  disabled={pagePeoples.current_page >= pagePeoples.pages}
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
        isOpen={isDialogOpenAddPeople}
        onClose={() => setIsDialogOpenAddPeople(false)}
        title="Thêm người"
      >
        <form onSubmit={handleSubmitAddPeople}>
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">
                Tên
              </label>
              <div className="mt-2">
                <input
                  id="name"
                  name="name"
                  required
                  className="px-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="country" className="block text-sm font-medium leading-6 text-gray-900">
                Role
              </label>
              <div className="mt-2">
                <select
                  id="role"
                  name="role"
                  autoComplete="country-name"
                  className="px-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                  onChange={handleSelectChange}
                >
                  {positions?.map((position) => (
                    <option key={position.id} value={position.id}>
                      {position.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="col-span-full">
              <label htmlFor="cover-photo" className="block text-sm font-medium leading-6 text-gray-900">
                Photo
              </label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-3 py-3">
                <div className="text-center">
                  {formDataAddPeople.pictureface ? (
                    <div className="relative">
                      <img src={formDataAddPeople.pictureface} alt="Uploaded" className="w-max h-96 object-cover rounded-lg" />
                      <button
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 px-2 rounded-full hover:bg-red-600"
                        title="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <>
                      <TbPhoto aria-hidden="true" className="mx-auto h-12 w-12 text-gray-300" />
                      <div className="mt-4 flex text-sm leading-6 text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            onChange={handleImageChange}
                            accept="image/png, image/jpeg, image/gif"
                          />
                        </label>
                        <p className="pl-1">or choose a file</p>
                      </div>
                      <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-x-6">
            <button type="button" className="text-sm font-semibold leading-6 text-gray-900" onClick={handleClickCloseModel}>
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Save
            </button>
          </div>
        </form>
      </Dialog>

      <Dialog
        isOpen={isDialogOpenDelePeople}
        onClose={() => setIsDialogOpenDelePeople(false)}
        title="Cảnh báo"
        buttonYesNo={true}
        OnYes={handleSubmitDelePeople}
        OnNo={() => setIsDialogOpenDelePeople(false)}
      >
        <p>Bạn có chắc chắn muốn xóa {getNameById(idPeopleDele)} không?</p>
      </Dialog>

      <Dialog
        isOpen={isDialogOpenUpdatePeople}
        onClose={() => setIsDialogOpenUpdatePeople(false)}
        title="Sửa thông tin người"
      >
        <form onSubmit={handleSubmitUpdatePeople}>
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">
                Tên
              </label>
              <div className="mt-2">
                <input
                  id="name"
                  name="name"
                  value={formDataAddPeople.name}
                  required
                  className="px-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="country" className="block text-sm font-medium leading-6 text-gray-900">
                Role
              </label>
              <div className="mt-2">
                <select
                  id="role"
                  name="role"
                  value={formDataAddPeople.role}
                  autoComplete="country-name"
                  className="px-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                  onChange={handleSelectChange}
                >
                  {positions?.map((position) => (
                    <option key={position.id} value={position.id}>
                      {position.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="col-span-full">
              <label htmlFor="cover-photo" className="block text-sm font-medium leading-6 text-gray-900">
                Photo
              </label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-3 py-3">
                <div className="text-center">
                  {formDataAddPeople.pictureface ? (
                    <div className="relative">
                      <img src={formDataAddPeople.pictureface} alt="Uploaded" className="w-full h-96 object-cover rounded-lg" />
                      <button
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 px-2 rounded-full hover:bg-red-600"
                        title="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <>
                      <TbPhoto aria-hidden="true" className="mx-auto h-12 w-12 text-gray-300" />
                      <div className="mt-4 flex text-sm leading-6 text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            onChange={handleImageChange}
                            accept="image/png, image/jpeg, image/gif"
                          />
                        </label>
                        <p className="pl-1">or choose a file</p>
                      </div>
                      <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-x-6">
            <button type="button" className="text-sm font-semibold leading-6 text-gray-900" onClick={handleClickCloseModel}>
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-indigo-300"
            >
              Update
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default DailyAttendanceManager;
