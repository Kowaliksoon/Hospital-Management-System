import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack"
import Navbar from "../components/Navbar";

export default function StaffLogin() {
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const [loginForm, setLoginForm] = useState({
        email: "",
        password: "",
    });

    const handleLogin = async () => {

        console.log("Dane do wysłania:", loginForm);
        
        if (!loginForm.email || !loginForm.password) {
            enqueueSnackbar("Wypełnij wszystkie pola!", { variant: "warning" });
            return;
        }

        // opcjonalnie walidacja prostego formatu email
        if (!loginForm.email.includes("@")) {
            enqueueSnackbar("Nieprawidłowy format email!", { variant: "warning" });
            return;
        }

        try {
            const res = await fetch("http://localhost:8000/staffLogin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loginForm),
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem("staff_id", data.staff_id);
                enqueueSnackbar("Zalogowano pomyślnie!", { variant: "success" });
                navigate(`/staff/profile/${data.staff_id}`);
            } else {
                enqueueSnackbar(
                    typeof data.detail === "object"
                        ? JSON.stringify(data.detail)
                        : data.detail || "Błędny email lub hasło",
                    { variant: "error" }
                );
            }
        } catch (error) {
            console.error(error);
            enqueueSnackbar("Błąd sieci!", { variant: "error" });
        }
    };

    return (
        <>
            <Navbar />
            <div className="flex flex-col items-center justify-center mt-10">
                <div className="flex flex-col w-full max-w-sm border-2 border-blue-800 p-5 rounded-xl">
                    <h1 className="text-center text-xl font-semibold mb-6">
                        Logowanie personelu
                    </h1>

                    <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
                        <div>
                            <p className="mb-1">Email</p>
                            <input
                                type="email"
                                className="border border-blue-800 w-full px-2 py-1 rounded"
                                value={loginForm.email}
                                onChange={(e) =>
                                    setLoginForm({ ...loginForm, email: e.target.value })
                                }
                            />
                        </div>

                        <div>
                            <p className="mb-1">Hasło</p>
                            <input
                                type="password"
                                className="border border-blue-800 w-full px-2 py-1 rounded"
                                value={loginForm.password}
                                onChange={(e) =>
                                    setLoginForm({ ...loginForm, password: e.target.value })
                                }
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleLogin}
                            className="bg-blue-800 text-white px-4 py-2 rounded mt-2 hover:bg-blue-900 transition"
                        >
                            Zaloguj
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
