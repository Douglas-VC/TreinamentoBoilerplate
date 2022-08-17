// login page overrides the form’s submit event and call Meteor’s loginWithPassword()
// Authentication errors modify the component’s state to be displayed
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import Container from '@mui/material/Container';
import TextField from '../../../ui/components/SimpleFormFields/TextField/TextField';
import Button from '@mui/material/Button';
import SimpleForm from '/imports/ui/components/SimpleForm/SimpleForm';

import { signinStyle } from './SigninStyle';
import { Typography } from '@mui/material';

export const SignIn = (props: any) => {
    const [redirectToReferer, setRedirectToReferer] = React.useState(false);

    const location = useLocation();

    const { showNotification, navigate, user } = props;

    const handleSubmit = (doc: { email: string; password: string }) => {
        const { email, password } = doc;
        Meteor.loginWithPassword(email, password, (err: any) => {
            if (err) {
                showNotification({
                    type: 'warning',
                    title: 'Acesso negado!',
                    description:
                        err.reason === 'Incorrect password'
                            ? 'Email ou senha inválidos'
                            : err.reason === 'User not found'
                            ? 'Este email não está cadastrado em nossa base de dados.'
                            : '',
                });
            } else {
                showNotification({
                    type: 'sucess',
                    title: 'Acesso autorizado!',
                    description: 'Login de usuário realizado em nossa base de dados!',
                });
                setRedirectToReferer(true);
            }
        });
    };

    const SocialLoginButton = ({ onLogin, buttonText, iconClass, customCss, iconOnly }) => (
        <div
            onClick={onLogin}
            className="material-button-contained"
            style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                height: 50,
                color: '#FFF',
                ...customCss,
            }}
        >
            <i className={iconClass} />
            {!iconOnly && <span style={{ marginLeft: 15 }}>{buttonText}</span>}
        </div>
    );

    const callbackLogin = (err) => {
        if (err) {
            console.log('Login Error: ', err);
            if (err.errorType === 'Accounts.LoginCancelledError') {
                showNotification('Autenticação cancelada', 'error');
                //self.setState({ error: 'AUtenticação cancelada' })
            } else {
                showNotification(err.error, 'error');
            }
        } else {
            setRedirectToReferer(true);
            navigate('/');
        }
    };

    const loginFacebook = () => {
        Meteor.loginWithFacebook({ requestPermissions: ['public_profile', 'email'] }, (err) => {
            callbackLogin(err);
        });
    };

    const loginGoogle = () => {
        Meteor.loginWithGoogle({ requestPermissions: ['profile', 'email'] }, (err) => {
            callbackLogin(err);
        });
    };

    React.useEffect(() => {
        if (!!user && !!user._id) navigate('/');
    }, [user]);

    React.useEffect(() => {
        if (location.pathname === '/signout') navigate('/signin');
    }, [location.pathname]);

    return (
        <>
            <Container style={{ width: '100%', maxWidth: 400 }}>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                        <h2 style={signinStyle.labelAccessSystem}>
                            <img src="/images/wireframe/logo.png" style={signinStyle.imageLogo} />
                        </h2>

                        <Typography
                            noWrap
                            variant='h1'
                        >
                            ToDo List
                        </Typography>

                        <Typography
                            noWrap
                            variant='body1'
                            sx={{ mt: '10px' }}
                        >
                            Boas-vindas a sua lista de tarefas.
                        </Typography>
                        <Typography
                            noWrap
                            variant='body1'
                            sx={{ mb: '10px' }}
                        >
                            Insira seu e-mail e senha para efetuar o login:
                        </Typography>

                        <SimpleForm
                            schema={{
                                email: { type: 'String', label: 'Email', optional: false },
                                password: { type: 'String', label: 'Senha', optional: false },
                            }}
                            onSubmit={handleSubmit}
                        >
                            <div>
                                <TextField
                                    label="Email"
                                    fullWidth={true}
                                    name="email"
                                    type="email"
                                    placeholder="Digite seu email"
                                />
                                <TextField
                                    label="Senha"
                                    fullWidth={true}
                                    name="password"
                                    placeholder="Digite sua senha"
                                    type="password"
                                />
                                <div style={signinStyle.containerButtonOptions}>
                                    <Button
                                        id="forgotPassword"
                                        color={'secondary'}
                                        variant={'outlined'}
                                        onClick={() => navigate('/recovery-password')}
                                    >
                                        {'Esqueci a minha senha'}
                                    </Button>
                                    <Button id="submit" variant={'outlined'} color={'primary'}>
                                        {'Entrar'}
                                    </Button>
                                </div>
                            </div>
                        </SimpleForm>
                        <div style={signinStyle.containerRouterSignUp}>
                            <Button
                                id="newUser"
                                color={'secondary'}
                                variant={'outlined'}
                                onClick={() => navigate('/signup')}
                            >
                                {'É novo por aqui? Clique aqui para se cadastrar!'}
                            </Button>
                        </div>
                </div>
            </Container>
        </>
    );
};
