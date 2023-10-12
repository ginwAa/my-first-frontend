import { useRouter } from 'vue-router';
async function request(request) {
    let {method, url, params, data} = request;
    let res;
    console.log(request);
    if (params) {
        let s = new URLSearchParams(params).toString();
        url += '?' + s;
    }
    if (data) {
        res = await fetch(url, {
            method: method,
            headers: {
                'Content-Type':'application/json',
            },
            body: JSON.stringify(data),
            mode: "cors",
            credentials: 'include',
        });
    } else {
        res = await fetch(url, {
            mode: "cors",
            credentials: 'include',
        });
    }
    if (!res.status || res.status != 200) {
        console.log("req err!", res);
        if (res.status && (res.status == 401 || res.status == 403)) {
            const router = useRouter();
            if (res.status == 401) {
                localStorage.removeItem('role');
                location.reload();
            }
        }
        return Promise.reject(res?.statusText);
    }
    return res.json();
}

export default request;