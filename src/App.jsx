import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Modal } from "bootstrap";

import PicModal from "./components/PicModal";
import Loading from "./components/Loading";

const API_BASE = import.meta.env.VITE_APP_API_BASE;
// 請自行替換 API_PATH
const API_PATH = import.meta.env.VITE_APP_API_PATH;

function App() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [alertMsg, setAlerMsg] = useState("");
  const [isAuth, setIsAuth] = useState(true);
  const [products, setProducts] = useState([]);
  const [tempProduct, setTempProduct] = useState(null);

  const modalRef = useRef(null);
  const myModal = useRef(null);
  const [photoUrl, setPhotoUrl] = useState(
    "https://images.unsplash.com/photo-1594322436404-5a0526db4d13?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bm90JTIwZm91bmR8ZW58MHx8MHx8fDA%3D"
  );
  const [isLoading, setIsLoading] = useState(false);

  //初始化，會先檢查是否有token 且 是有效的
  //如無效：就會呈現登入頁面
  useEffect(() => {
    myModal.current = new Modal(modalRef.current);
    checkLogin();
  }, []);

  //如有效：則會進一步觸發getData()，並渲染畫面
  useEffect(() => {
    if (isAuth === true) {
      getData();
    }
  }, [isAuth]);

  async function checkLogin() {
    try {
      setIsLoading(true);
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("react-week2-token="))
        ?.split("=")[1];
      axios.defaults.headers.common.Authorization = token;
      const res = await axios.post(`${API_BASE}/api/user/check`);
      if (res === "") {
        setIsAuth(false);
      } else {
        setIsAuth(true);
      }
    } catch (error) {
      setIsAuth(false);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const getData = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products`);
      setProducts(res.data.products);
    } catch (error) {
      console.error(error.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      const res = await axios.post(`${API_BASE}/admin/signin`, formData);
      const { token, expired } = res.data;
      document.cookie = `react-week2-token=${token};expires=${new Date(
        expired
      )};`;
      axios.defaults.headers.common.Authorization = `${token}`;
      setIsAuth(true);
    } catch (error) {
      setIsAuth(false);
      setAlerMsg(error.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getSinglePic = (url) => {
    setPhotoUrl(url);
    if (photoUrl !== "") {
      myModal.current.show();
    }
  };

  return (
    <>
      <Loading isLoading={isLoading} />
      <PicModal modalRef={modalRef} photoUrl={photoUrl} />
      {isAuth ? (
        <div className="container">
          <div className="row mt-5">
            <div className="col-md-6">
              <h2>產品列表</h2>
              <table className="table">
                <thead>
                  <tr>
                    <th>產品名稱</th>
                    <th>原價</th>
                    <th>售價</th>
                    <th>是否啟用</th>
                    <th>查看細節</th>
                  </tr>
                </thead>
                <tbody>
                  {products && products.length > 0 ? (
                    products.map((item) => (
                      <tr key={item.id}>
                        <td>{item.title}</td>
                        <td>{item.origin_price}</td>
                        <td>{item.price}</td>
                        <td>{item.is_enabled ? "啟用" : "未啟用"}</td>
                        <td>
                          <button
                            className="btn btn-primary"
                            onClick={() => setTempProduct(item)}
                          >
                            查看細節
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5">尚無產品資料</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="col-md-6">
              <h2>單一產品細節</h2>
              {tempProduct ? (
                <div className="card mb-3">
                  <img
                    src={tempProduct.imageUrl}
                    className="card-img-top primary-image"
                    alt={`${tempProduct.title}_旅遊主圖`}
                  />
                  <div className="card-body">
                    <h5 className="card-title">
                      {tempProduct.title}
                      <span className="badge bg-primary ms-2">
                        {tempProduct.category}
                      </span>
                    </h5>
                    <p className="card-text">
                      商品描述：{tempProduct.description}
                    </p>
                    <p className="card-text">商品內容：{tempProduct.content}</p>
                    <div className="d-flex">
                      <p className="card-text text-secondary">
                        <del>{tempProduct.origin_price}</del>
                      </p>
                      元 / {tempProduct.price} 元
                    </div>
                    <h5 className="mt-3">更多圖片：</h5>

                    <div className="d-flex flex-wrap">
                      <div className="row">
                        {tempProduct.imagesUrl?.map((url, index) => (
                          <div className="col-4 mt-3" key={index}>
                            <img
                              src={url}
                              className="images img-cover"
                              width="80%"
                              height="80"
                              alt={`旅遊更多圖片_${index + 1}`}
                              onClick={() => getSinglePic(url)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-secondary">請選擇一個商品查看</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="container login">
          <div className="row justify-content-center">
            <h1 className="h3 mb-3 font-weight-normal">請先登入</h1>
            <div className="col-8">
              <form id="form" className="form-signin" onSubmit={handleSubmit}>
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    className="form-control"
                    id="username"
                    placeholder="name@example.com"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    autoFocus
                  />
                  <label htmlFor="username">Email address</label>
                </div>
                <div className="form-floating">
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <label htmlFor="password">Password</label>
                </div>
                <button
                  className="btn btn-lg btn-primary w-100 mt-3"
                  type="submit"
                >
                  登入
                </button>
              </form>
            </div>
          </div>
          {alertMsg !== "" ? (
            <h1 className="h-4 text-danger"> {alertMsg}</h1>
          ) : (
            ""
          )}

          <p className="mt-5 mb-3 text-muted">&copy; 2024~∞ - 六角學院</p>
        </div>
      )}
    </>
  );
}

export default App;
