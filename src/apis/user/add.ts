import request from '@/utils/request.ts';
export type UserAddDTO = {
    account: string,
    username: string,
    password: string,
    gender: number,
    phone: string,
    email: string,
    status: number,
    role: number,
};

export async function userAdd(user: UserAddDTO) {
    let res
    try {
        res = await request({
            method: 'post',
            url: 'http://localhost:8081/user/add',
            data: {
                account: user.account,
                username: user.username,
                password: user.password,
                phone: user.phone,
                email: user.email,
                role: user.role,
                status: user.status,
                gender: user.gender,
            },
        });
    } catch (err) {
        return Promise.reject(err);
    }
    console.log(res);
    if (!res.status || res.status != 200) {
        return Promise.reject(res?.msg);
    } else {
        return Promise.resolve(res.data.id);
    }
};
