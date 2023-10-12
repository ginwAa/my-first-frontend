import request from '@/utils/request.ts';
async function userDelete(id: number) {
    let res;
    try {
        res = await request({
            method: 'POST',
            url: 'http://localhost:8081/user/delete',
            data: {
                id: id,
            },
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
export default userDelete;