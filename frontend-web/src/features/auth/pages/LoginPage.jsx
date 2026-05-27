import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import loginImage from "../../../assets/images/login-banner.png";
import logoImage from "../../../assets/images/logo-white.png";

const LoginPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [errors, setErrors] = useState({});

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // HANDLE INPUT
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });

        // CLEAR ERROR WHEN TYPING
        setErrors({
            ...errors,
            [e.target.name]: "",
        });
    };

    // VALIDATE FORM
    const validateForm = () => {
        let newErrors = {};

        // EMAIL
        if (!formData.email.trim()) {
            newErrors.email = "Vui lòng nhập email";
        } else if (
            !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
        ) {
            newErrors.email = "Email không hợp lệ";
        }

        // PASSWORD
        if (!formData.password.trim()) {
            newErrors.password = "Vui lòng nhập mật khẩu";
        } else if (formData.password.length < 6) {
            newErrors.password = "Mật khẩu tối thiểu 6 ký tự";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // LOGIN
    const handleLogin = async (e) => {
        e.preventDefault();

        // VALIDATE
        if (!validateForm()) return;

        try {
            setLoading(true);

            const res = await axios.post(
                "http://localhost:4000/api/auth/login",
                formData
            );
            console.log(res.data);
            localStorage.setItem("token", res.data.token);

            toast.success("Đăng nhập thành công");
            setTimeout(() => {
                navigate("/home");
            }, 1000);

            console.log(res.data);

        } catch (error) {
            console.error(error);

            toast.error(
                error.response?.data?.message ||
                "Đăng nhập thất bại"
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center">

            {/* BACKGROUND IMAGE */}
            <img
                src={loginImage}
                alt="AI Story Background"
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* OVERLAY */}
            <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" />

            {/* LOGIN CARD */}
            <div className="relative z-10 w-full max-w-[460px] bg-white/12 backdrop-blur-2xl border border-white/20 rounded-[32px] px-6 sm:px-10 py-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">

                {/* HEADER */}
                <div className="text-center">

                    <div className="flex items-center justify-center">

                        {/* LOGO */}
                        <div className="relative flex items-center justify-center">
                            <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full"></div>

                            <img
                                src={logoImage}
                                alt="BaoStory"
                                className="relative w-16 h-16 mt-4 md:w-20 md:h-20 object-contain drop-shadow-[0_8px_25px_rgba(255,255,255,0.35)]"
                            />
                        </div>

                        {/* TITLE */}
                        <h1 className="text-3xl font-black tracking-[1px] bg-gradient-to-r from-white via-orange-100 to-yellow-200 bg-clip-text text-transparent drop-shadow-[0_5px_20px_rgba(255,255,255,0.2)]">
                            Đăng nhập
                        </h1>

                    </div>
                </div>

                {/* FORM */}
                <form onSubmit={handleLogin} className="space-y-3">

                    {/* EMAIL */}
                    <div>

                        <label className="block mb-2 text-sm font-semibold text-white">
                            Email
                        </label>

                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Nhập email"
                            className={`w-full px-4 py-3.5 rounded-2xl border bg-white/10 text-white placeholder:text-gray-300 focus:bg-white/15 focus:ring-4 outline-none transition-all
                                
                                ${errors.email
                                    ? "border-red-400 focus:ring-red-400/20"
                                    : "border-white/20 focus:border-blue-400 focus:ring-blue-400/20"
                                }
                            `}
                        />

                        {errors.email && (
                            <p className="mt-2 text-sm text-red-400">
                                {errors.email}
                            </p>
                        )}

                    </div>

                    {/* PASSWORD */}
                    <div>

                        <div className="flex items-center justify-between mb-2">

                            <label className="text-sm font-semibold text-white">
                                Mật khẩu
                            </label>

                            <button
                                type="button"
                                className="text-sm text-blue-300 hover:text-blue-200"
                            >
                                Quên mật khẩu?
                            </button>

                        </div>

                        <div className="relative">

                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Nhập mật khẩu"
                                className={`w-full px-4 py-3.5 pr-14 rounded-2xl border bg-white/10 text-white placeholder:text-gray-300 focus:bg-white/15 focus:ring-4 outline-none transition-all
                                    
                                    ${errors.password
                                        ? "border-red-400 focus:ring-red-400/20"
                                        : "border-white/20 focus:border-blue-400 focus:ring-blue-400/20"
                                    }
                                `}
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 text-lg"
                            >
                                {showPassword
                                    ? <i className="bi bi-eye-slash"></i>
                                    : <i className="bi bi-eye"></i>
                                }
                            </button>

                        </div>

                        {errors.password && (
                            <p className="mt-2 text-sm text-red-400">
                                {errors.password}
                            </p>
                        )}

                    </div>

                    {/* LOGIN BUTTON */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 hover:scale-[1.01] active:scale-[0.99] text-white font-semibold transition-all shadow-lg disabled:opacity-70"
                    >
                        {loading ? "Đang tải..." : "Đăng nhập"}
                    </button>

                </form>

                {/* DIVIDER */}
                <div className="relative my-4">

                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                    </div>

                    <div className="relative flex justify-center">
                        <span className="bg-transparent px-4 text-sm text-gray-300">
                            Hoặc đăng nhập với
                        </span>
                    </div>

                </div>

                {/* GOOGLE LOGIN */}
                <button className="w-full py-3.5 rounded-2xl border border-white/20 bg-white/10 hover:bg-white/15 transition-all flex items-center justify-center gap-3 font-medium text-white">

                    <img
                        src="https://www.svgrepo.com/show/475656/google-color.svg"
                        alt="Google"
                        className="w-5 h-5"
                    />

                    Đăng nhập bằng Google

                </button>

                {/* FOOTER */}
                <div className="mt-7 text-center">

                    <p className="text-sm text-gray-300">

                        Bạn chưa có tài khoản?

                        <Link
                            to="/register"
                            className="ml-2 font-semibold text-blue-300 hover:text-blue-200"
                        >
                            Đăng ký
                        </Link>

                    </p>

                </div>

            </div>
        </div>
    );
};

export default LoginPage;