// Generated by https://quicktype.io

export interface CheckTokenInterface {
    user:  User;
    token: string;
}

export interface User {
    _id:      string;
    name:     string;
    lastName: string;
    dni:      number;
    role:     string;
    __v:      number;
}
