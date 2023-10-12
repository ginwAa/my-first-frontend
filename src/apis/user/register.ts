import request from '@/utils/request.ts';

export type UserRegisterDTO = {
    account: string,
    username: string,
    password: string,
    gender: number,
    phone: string,
    email: string
};

export async function userRegister(user: UserRegisterDTO) {
    let res
    try {
        res = await request({
            method: 'post',
            url: 'http://localhost:8081/user/register',
            data: {
                account: user.account,
                username: user.username,
                password: user.password,
                phone: user.phone,
                email: user.email,
                role: 2,
                status: 1,
                gender: user.gender,
            }
        });
    } catch (err) {
        return Promise.reject(err);
    }
    console.log(res);
    if (!res.status || res.status != 200) {
        return Promise.reject(res?.msg);
    } else {
        return Promise.resolve();
    }
};
