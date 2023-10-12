import request from '@/utils/request.ts';
async function userPage(username: string, page: number, size: number) {
    let res;
    try {
        res = await request({
            method: 'GET',
            url: 'http://localhost:8081/user/page',
            params: {
                username: username,
                page: page,
                size: size,
            },
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
export default userPage;