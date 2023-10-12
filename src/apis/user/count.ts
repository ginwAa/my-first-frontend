import request from '@/utils/request.ts';
async function userCount(username: string) {
    let res;
    try {
        res = await request({
            method: 'GET',
            url: 'http://localhost:8081/user/count',
            params: {
                username: username,
            }
        });
    } catch (err) {
        return Promise.reject(err);
    }
    console.log(res);
    if (!res.status || res.status != 200) {
        return Promise.reject(res?.msg);
    } else {
        return Promise.resolve(res.data);
    }
};
export default userCount;