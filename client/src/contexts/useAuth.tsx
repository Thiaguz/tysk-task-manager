import React, { createContext, useState, useContext, useEffect } from 'react';
import AuthContextProps from '~/interfaces/auth';
import Login from '~/interfaces/login';
import Loading from '~/pages/loading';
import api from '~/services/axios';
import { useAlert } from 'react-alert';
import { useHistory } from 'react-router-dom';

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export const AuthProvider: React.FC = ({ children }) => {
    const [login, setLogin] = useState<Login | null>(null);
    const [loading, setLoading] = useState(false);
    const alert = useAlert();
    const history = useHistory();

    useEffect(() => {
        (async () => {
            try {
                const token = window.localStorage.getItem('token') || '';
                if (token) {
                    setLoading(true);
                    const results = (
                        await api.post(
                            '/login',
                            {},
                            {
                                headers: {
                                    authorization: 'Bearer ' + token,
                                },
                            }
                        )
                    ).data as Login;

                    setLogin(results);
                    setLoading(false);
                }
            } catch (err) {
                window.localStorage.setItem('token', '');
                history.push('/login');
                setLoading(false);
            }
        })();
    }, [history]);

    async function signIn(
        username: string,
        password: string
    ): Promise<Login | undefined> {
        try {
            setLoading(true);
            const results = (
                await api.post(
                    '/login',
                    { username, password },
                    {
                        headers: {
                            authorization: '',
                        },
                    }
                )
            ).data as Login;
            window.localStorage.setItem('token', results.token || '');

            setLogin(results);
            setLoading(false);

            return results;
        } catch (err) {
            switch (parseInt(err.message.match(/\d+/g))) {
                case 404:
                    alert.error('User or password incorrect');
                    break;

                case 500:
                    console.error(new Error(err.message));
                    alert.error(
                        'Estamos com problemas, tente novamente mais tarde.'
                    );
                    break;

                default:
                    break;
            }
        } finally {
            setLoading(false);
        }
    }

    async function signUp(username: string, password: string) {
        try {
            setLoading(true);
            const results = (
                await api.post(
                    '/users',
                    { username, password },
                    {
                        headers: {
                            authorization: '',
                        },
                    }
                )
            ).data as Login;

            window.localStorage.setItem('token', results.token || '');
            alert.success('Account created');
            history.push('/login');

            return results;
        } catch (err) {
            console.error(new Error(err.message));
            alert.error('Estamos com problemas, tente novamente mais tarde.');
        } finally {
            setLoading(false);
        }
    }

    async function signOut() {
        window.localStorage.setItem('token', '');
        setLogin(null);
    }

    return (
        <AuthContext.Provider
            value={
                {
                    signed: !!login,
                    login,
                    signIn,
                    signUp,
                    signOut,
                    loading,
                } as AuthContextProps
            }
        >
            {loading && <Loading />}
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    return context;
};

export default useAuth;
