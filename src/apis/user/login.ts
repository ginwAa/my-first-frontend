import request from '@/utils/request.ts';
async function userLogin(account: string, password: string) {
    let res;
    try {
        res = await request({
            method: 'POST',
            url: 'http://localhost:8081/user/login',
            data: {
                account: account,
                password: password,
            }
        });
    } catch (err) {
        console.log("login err ", err);
        return Promise.reject(err);
    }

    if (!res.status || res.status != 200) {
        return Promise.reject(res?.msg);
    } else if (!res.data?.success) {
        return Promise.reject('Account or Password not match!');
    } else {
        return Promise.resolve({
            token: res.data.token,
            role: res.data.role,
        });
    }
};
export default userLogin;