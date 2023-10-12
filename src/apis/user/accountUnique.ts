import request from '@/utils/request.ts';
async function userCheckAccountUnique(account: string) {
    let res
    try {
        res = await request({
            method: 'GET',
            url: 'http://localhost:8081/user/account-unique',
            params: {
                account: account,
            }
        });
    } catch (err) {
        console.log("login err ", err);
        return Promise.reject(err);
    }
    console.log(res);
    if (!res.status || res.status != 200) {
        return Promise.reject(res?.msg);
    } else {
        return Promise.resolve(res.data);
    }
};
export default userCheckAccountUnique;