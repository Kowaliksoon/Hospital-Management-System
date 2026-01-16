import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import Logo from "../assets/Logo.png";
import Navbar from "../components/Navbar";

export default function PatientLogin() {
    const [mode, setMode] = useState("login");
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);

    const [loginForm, setLoginForm] = useState({
        pesel: "",
        password: "",
    });

    const [registerForm, setRegisterForm] = useState({
        name: "",
        surname: "",
        email: "",
        pesel: "",
        password: "",
    });

    const [registerErrors, setRegisterErrors] = useState({});

    // Walidacja rejestracji
    const validateRegisterForm = () => {
        const errors = {};
        if (!registerForm.name.trim()) errors.name = "Imię jest wymagane";
        if (!registerForm.surname.trim()) errors.surname = "Nazwisko jest wymagane";
        if (!registerForm.email.includes("@")) errors.email = "Nieprawidłowy email";
        if (!/^\d{11}$/.test(registerForm.pesel)) errors.pesel = "PESEL musi mieć 11 cyfr";
        if (!registerForm.password.trim()) errors.password = "Hasło jest wymagane";

        setRegisterErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Obsługa rejestracji
    const handleRegister = async () => {
        if (!validateRegisterForm()) return;

        try {
            const resCheck = await fetch(`http://localhost:8000/users/check-pesel/${registerForm.pesel}`);
            const dataCheck = await resCheck.json();

            if (dataCheck.exists) {
                setRegisterErrors(prev => ({ ...prev, pesel: "Konto z tym PESEL już istnieje" }));
                enqueueSnackbar("Konto z tym PESEL już istnieje", { variant: "warning" });
                return;
            }
        } catch (err) {
            console.error("Błąd sprawdzania PESEL:", err);
            enqueueSnackbar("Nie udało się sprawdzić PESEL. Spróbuj ponownie.", { variant: "error" });
            return;
        }

        try {
            const res = await fetch("http://localhost:8000/userRegister", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(registerForm),
            });

            const data = await res.json();
            console.log(data);

            if (res.ok) {
                enqueueSnackbar("Rejestracja zakończona sukcesem!", { variant: "success" });
                setMode("login");
            } else {
                enqueueSnackbar(data.detail || "Coś poszło nie tak.", { variant: "error" });
            }
        } catch (error) {
            console.error(error);
            enqueueSnackbar("Błąd sieci!", { variant: "error" });
        }
    };

    // Obsługa logowania
    const handleLogin = async () => {
        setLoading(true);
        try {
            const res = await fetch("http://localhost:8000/userLogin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loginForm),
            });

            const data = await res.json();
            console.log(data);

            if (res.ok) {
                localStorage.setItem("user_id", data.user_id);
                enqueueSnackbar("Zalogowano pomyślnie!", { variant: "success" });
                navigate(`/profile/${data.user_id}`);
            } else {
                enqueueSnackbar(data.detail || "Błędny PESEL lub hasło", { variant: "error" });
            }
        } catch (error) {
            console.error(error);
            enqueueSnackbar("Błąd sieci!", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className='flex flex-col items-center justify-center'>
                <div className='flex flex-col w-full max-w-sm mt-10 justify-center items-center border-2 border-blue-800 p-5 rounded-xl'>
                    <img src={Logo} className='w-24 mx-auto mb-4 object-contain' alt='Logo Szpitala' />

                    <h1 className='text-center mb-6 text-xl font-semibold'>Diagnostyka Szpitala</h1>

                    <div className='flex gap-3 mb-6'>
                        <button
                            onClick={() => setMode("login")}
                            className={`px-4 py-2 rounded border cursor-pointer ${mode === "login" ? "bg-blue-800 text-white" : "border-blue-800 text-blue-800"}`}
                        >
                            Logowanie
                        </button>

                        <button
                            onClick={() => setMode("register")}
                            className={`px-4 py-2 rounded border cursor-pointer ${mode === "register" ? "bg-blue-800 text-white" : "border-blue-800 text-blue-800"}`}
                        >
                            Rejestracja
                        </button>
                    </div>

                    {mode === "login" && (
                        <form className='w-full flex flex-col gap-5'>
                            <div>
                                <p className='mb-1'>PESEL</p>
                                <input
                                    type='text'
                                    className='border border-blue-800 w-full px-2 py-1 rounded'
                                    value={loginForm.pesel}
                                    onChange={e => setLoginForm({ ...loginForm, pesel: e.target.value })}
                                />
                            </div>

                            <div>
                                <p className='mb-1'>Hasło</p>
                                <input
                                    type='password'
                                    className='border border-blue-800 w-full px-2 py-1 rounded'
                                    value={loginForm.password}
                                    onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                                />
                            </div>

                            {loading && (
                                <div className="flex justify-center mb-2">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            )}

                            <button
                                type='button'
                                onClick={handleLogin}
                                className='bg-blue-800 text-white px-4 py-2 rounded mt-2'
                                disabled={loading}
                            >
                                Zaloguj
                            </button>
                        </form>
                    )}

                    {mode === "register" && (
                        <form className='w-full flex flex-col gap-5'>
                            {/* Imię */}
                            <div>
                                <label className="block mb-1 font-medium" htmlFor="name">Imię</label>
                                <input
                                    id="name"
                                    type="text"
                                    className='border border-blue-800 w-full px-2 py-1 rounded'
                                    placeholder="Imię"
                                    value={registerForm.name}
                                    onChange={e => setRegisterForm({ ...registerForm, name: e.target.value })}
                                />
                                {registerErrors.name && <p className="text-sm text-red-600 mt-1">{registerErrors.name}</p>}
                            </div>

                            {/* Nazwisko */}
                            <div>
                                <label className="block mb-1 font-medium" htmlFor="surname">Nazwisko</label>
                                <input
                                    id="surname"
                                    type="text"
                                    className='border border-blue-800 w-full px-2 py-1 rounded'
                                    placeholder="Nazwisko"
                                    value={registerForm.surname}
                                    onChange={e => setRegisterForm({ ...registerForm, surname: e.target.value })}
                                />
                                {registerErrors.surname && <p className="text-sm text-red-600 mt-1">{registerErrors.surname}</p>}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block mb-1 font-medium" htmlFor="email">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    className='border border-blue-800 w-full px-2 py-1 rounded'
                                    placeholder="Email"
                                    value={registerForm.email}
                                    onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
                                />
                                {registerErrors.email && <p className="text-sm text-red-600 mt-1">{registerErrors.email}</p>}
                            </div>

                            {/* PESEL */}
                            <div>
                                <label className="block mb-1 font-medium" htmlFor="pesel">PESEL</label>
                                <input
                                    id="pesel"
                                    type="text"
                                    className='border border-blue-800 w-full px-2 py-1 rounded'
                                    placeholder="PESEL"
                                    value={registerForm.pesel}
                                    onChange={e => setRegisterForm({ ...registerForm, pesel: e.target.value })}
                                />
                                {registerErrors.pesel && <p className="text-sm text-red-600 mt-1">{registerErrors.pesel}</p>}
                            </div>

                            {/* Hasło */}
                            <div>
                                <label className="block mb-1 font-medium" htmlFor="password">Hasło</label>
                                <input
                                    id="password"
                                    type="password"
                                    className='border border-blue-800 w-full px-2 py-1 rounded'
                                    placeholder="Hasło"
                                    value={registerForm.password}
                                    onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
                                />
                                {registerErrors.password && <p className="text-sm text-red-600 mt-1">{registerErrors.password}</p>}
                            </div>

                            <button
                                type='button'
                                onClick={handleRegister}
                                className='bg-blue-800 text-white px-4 py-2 rounded mt-2'
                            >
                                Zarejestruj
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
}
