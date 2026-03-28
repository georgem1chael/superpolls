import { useContext, useEffect, useId, type FC, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { AuthContext } from "./AuthContext";

interface Props {
    isSignup: boolean;
}

const LoginPage: FC<Props> = ({ isSignup }) => {
    const nameFieldId = useId();
    const emailFieldId = useId();
    const passwordFieldId = useId();

    const navigate = useNavigate();

    const { user, authError, login, signup } = useContext(AuthContext);

    function submitForm(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const form = event.target as HTMLFormElement;
        const data = new FormData(form);

        const name = data.get("name") as string;
        const email = data.get("email") as string;
        const password = data.get("password") as string;

        if (isSignup) signup(name, email, password);
        else login(email, password);
    }

    useEffect(() => {
        if (user != null) navigate("/dashboard");
    }, [user]);

    return (
        <main className="login">
            <div className="wrapper narrow">
                <h1>{isSignup ? "Sign up" : "Log in"}</h1>

                {authError && <p>{authError}</p>}

                <form onSubmit={submitForm} className="login__form">
                    {isSignup && (
                        <>
                            <label htmlFor={nameFieldId}>Name</label>
                            <input id={nameFieldId} type="text" name="name" />
                        </>
                    )}

                    <label htmlFor={emailFieldId}>Email address</label>
                    <input id={emailFieldId} type="text" name="email" />

                    <label htmlFor={passwordFieldId}>Password</label>
                    <input
                        id={passwordFieldId}
                        type="password"
                        name="password"
                    />

                    <button className="btn btn-primary">
                        {isSignup ? "Sign up!" : "Login!"}
                    </button>
                </form>

                {isSignup ? (
                    <p>
                        Already have an account?{" "}
                        <Link to="/login">Click here to login</Link>
                    </p>
                ) : (
                    <p>
                        Don't have an account yet?{" "}
                        <Link to="/signup">Click here to signup!</Link>
                    </p>
                )}
            </div>
        </main>
    );
};

export default LoginPage;
