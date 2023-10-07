<template>
  <div>
    <a-table :columns="columns" :dataSource="userDataList.data" :loading="userDataList.loading"
             :pagination="false" :scroll="{ x: 1600, y: 500 }" style="width: 1200px"
    >
      <template #customFilterDropdown="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }">
        <div style="padding: 8px">
          <!--placeholder:设置文本框提示文本 change:文本改变时 pressEnter:确认按钮-->
          <a-input
              ref="searchInput"
              :value="selectedKeys[0]"
              :placeholder="`Search ${column.dataIndex}`"
              style="width: 188px; margin-bottom: 8px; display: block"
              @change="e => setSelectedKeys(e.target.value ? [e.target.value] : [])"
              @pressEnter="usernameSearch(selectedKeys, confirm)"
          />
          <a-button type="primary" size="small" style="width: 90px; margin-right: 8px" @click="usernameSearch(selectedKeys, confirm, column.dataIndex)">
            <template #icon><SearchOutlined/></template>
            Search
          </a-button>
          <a-button size="small" style="width: 90px" @click="usernameSearchReset(clearFilters)">
            Reset
          </a-button>
        </div>
      </template>
      <template #customFilterIcon="{ filtered }">
        <search-outlined :style="{ color: filtered ? '#108ee9' : undefined }" />
      </template>
      <template #bodyCell="{ column, text, record }">
        <template v-if="column.dataIndex === 'username'">
          <div class="editable-cell">
            <div v-if="editableData[record.id] && editableData[record.id][column.title]" class="editable-cell-input-wrapper">
              <a-input v-model:value="editableData[record.id].username" @pressEnter="save(record.id, 'username')" />
              <check-outlined class="editable-cell-icon-check" @click="save(record.id, 'username')" />
            </div>
            <div v-else class="editable-cell-text-wrapper">
              {{ text}}
              <edit-outlined class="editable-cell-icon" @click="edit(record.id, 'username', text)" />
            </div>
          </div>
        </template>
        <template v-else-if="column.dataIndex === 'gender'">{{ text === 1 ? 'Male' : 'Female' }}</template>
        <template v-else-if="column.dataIndex === 'role'">{{ text === 1 ? 'Normal' : 'Admin' }}</template>
        <template v-else-if="column.dataIndex === 'createdAt'">{{ dateString(text) }}</template>
        <template v-else-if="column.dataIndex === 'updatedAt'">{{ dateString(text) }}</template>
        <template v-else-if="column.dataIndex === 'status'">{{ text === 1 ? 'Active' : 'Frozen' }}</template>
        <template v-else-if="column.dataIndex === 'delete'">
          <a-button danger>
            <a-popconfirm title="Sure to delete?" @confirm="onDelete(record.id)">
              Delete
            </a-popconfirm>
          </a-button>
        </template>
        <template v-else-if="column.dataIndex === 'editPassword'">
          <div>
            <a-button type="text" @click="editPasswordFormVisible = true">Edit Pass</a-button>
            <a-modal v-model:open="editPasswordFormVisible" title="Edit password" @ok="onEditPasswordFormOk(record.id)">
              <a-form ref="editPasswordFormRef" :model="editPasswordFormData" layout="vertical" name="editPasswordForm" :rules="editPasswordFormRules">

                <a-form-item name="password" label="Password">
                  <a-input-password v-model:value="editPasswordFormData.password" autocomplete="off" allow-clear />
                </a-form-item>

                <a-form-item name="checked" label="Password Again">
                  <a-input v-model:value="editPasswordFormData.checked" type="password" autocomplete="off" allow-clear />
                </a-form-item>

              </a-form>
            </a-modal>
          </div>

        </template>
      </template>
      <template #title>
        <div class="title">
          <div class="listTitle">Users List</div>
          <div class="listTotal">total: {{userDataList.total}}</div>
        </div>
      </template>

    </a-table>
    <div class="listBottom">
      <div class="addUserButton">
        <a-button type="primary" @click="addFormVisible = true">Add</a-button>
        <a-modal v-model:open="addFormVisible" title="Create a new user" ok-text="Create" cancel-text="Cancel" @ok="onAddFormOk">
          <a-form ref="addFormRef" :model="addFormData" layout="vertical" name="addForm" :rules="addFormRules">

            <a-form-item name="account" label="Account">
              <a-input v-model:value="addFormData.account" />
            </a-form-item>

            <a-form-item name="username" label="Username">
              <a-input v-model:value="addFormData.username" />
            </a-form-item>

            <a-form-item name="password" label="Password">
              <a-input-password v-model:value="addFormData.password" autocomplete="off" allow-clear />
            </a-form-item>

            <a-form-item name="checked" label="Password Again">
              <a-input v-model:value="addFormData.checked" type="password" autocomplete="off" allow-clear />
            </a-form-item>

            <a-form-item name="phone" label="Phone">
              <a-input v-model:value="addFormData.phone" />
            </a-form-item>

            <a-form-item name="email" label="Email">
              <a-input v-model:value="addFormData.email" />
            </a-form-item>

            <a-form-item name="gender" label="Gender">
              <a-radio-group v-model:value="addFormData.gender">
                <a-radio value=1>Male</a-radio>
                <a-radio value=2>Female</a-radio>
              </a-radio-group>
            </a-form-item>

            <a-form-item name="role" label="Role">
              <a-radio-group v-model:value="addFormData.role">
                <a-radio value=1>Normal</a-radio>
                <a-radio value=2>Admin</a-radio>
              </a-radio-group>
            </a-form-item>

            <a-form-item name="status" label="Status" class="collection-create-form_last-form-item">
              <a-radio-group v-model:value="addFormData.status">
                <a-radio value=1>Active</a-radio>
                <a-radio value=2>Frozen</a-radio>
              </a-radio-group>
            </a-form-item>

          </a-form>
        </a-modal>
      </div>
      <a-pagination
        :current="userDataList?.curPage"
        :total="userDataList?.total"
        :pageSize="userDataList?.pageSize"
        @change="pageChange"
        show-size-changer
        @showSizeChange="pageSizeChange"
        class="pagination"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { reactive, onMounted, ref, computed } from 'vue';
import type { Ref, UnwrapRef } from 'vue';
import { Table, Pagination, FormInstance } from 'ant-design-vue';
import { SearchOutlined, CheckOutlined, EditOutlined } from '@ant-design/icons-vue';
import type { Rule } from 'ant-design-vue/es/form';
const checkPasswordAgain = async (_rule: Rule, value: string) => {
  if (value === '') {
    return Promise.reject();
  } else if (value !== addFormData.password) {
    return Promise.reject("Two inputs don't match!");
  } else {
    return Promise.resolve();
  }
};
const checkAccountUnique = async (_rule: Rule, value: string) => {
  if (value === '') {
    return Promise.reject();
  }
  try {
    let res = await http({
      method: 'GET',
      url: 'http://localhost:8081/user/count',
      params: {
        account: value,
        like: false,
      },
    });
    console.log(res);
    if (res?.data != 0) {
      return Promise.reject("This account has been used!");
    }
  } catch (error) {
    console.log(error);
    return Promise.reject();
  }
  return Promise.resolve();
};
const addFormRules: Record<string, Rule[]> = {
  account: [{ required: true, message: 'Please input account!', trigger: 'change' },
    { validator: checkAccountUnique, trigger: 'change' }],
  username: [{ required: true, message: 'Please input username!', trigger: 'change' }],
  password: [{ required: true, message: 'Please input password!', trigger: 'change' }],
  checked: [{ required: true, message: 'Please input password again!', trigger: 'change' },
    { validator: checkPasswordAgain, trigger: 'change' }],
  phone: [{ required: true, message: 'Please input phone!', trigger: 'change' }],
  email: [{ required: true, message: 'Please input email!', trigger: 'change' }],
  status: [{ required: true, message: 'Please input status!', trigger: 'change' }],
  gender: [{ required: true, message: 'Please input gender!', trigger: 'change' }],
  role: [{ required: true, message: 'Please input role!', trigger: 'change' }],
};
const checkPasswordAgainEditPassword = async (_rule: Rule, value: string) => {
  if (value === '') {
    return Promise.reject();
  } else if (value !== editPasswordFormData.password) {
    return Promise.reject("Two inputs don't match!");
  } else {
    return Promise.resolve();
  }
};
const editPasswordFormRules: Record<string, Rule[]> = {
  password: [{ required: true, message: 'Please input password!', trigger: 'change' }],
  checked: [{ required: true, message: 'Please input password again!', trigger: 'change' },
    { validator: checkPasswordAgainEditPassword, trigger: 'change' }],
};

const dateString = (str: string) => {
  return str.substring(0, 4) + '/' + str.substring(5, 7) + '/' + str.substring(8, 10) + '@' + str.substring(11, 19);
};
const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    // sorter: {
    //   compare: (x, y) => {
    //     return x.Id - y.Id;
    //   },
    // },
    width: 100,
    fixed: 'left',
  },
  {
    title: 'account',
    dataIndex: 'account',
    width: 150,
    ellipsis: true,
  },
  {
    title: 'username',
    dataIndex: 'username',
    width: 150,
    customFilterDropdown: true,
    ellipsis: true,
  },
  {
    title: 'gender',
    dataIndex: 'gender',
    // sorter: {
    //   compare: (x, y) => { return x.Gender - y.Gender; },
    //   multiple: 10,
    // },
    // filters: [
    //   { text: 'Male', value: 1 },
    //   { text: 'Female', value: 2 },
    // ],
    width: 90,
  },
  {
    title: 'email',
    dataIndex: 'email',
    width: 200,
    ellipsis: true,
  },
  {
    title: 'phone',
    dataIndex: 'phone',
    width: 120,
    ellipsis: true,
  },
  {
    title: 'role',
    dataIndex: 'role',
    width: 90,
  },
  {
    title: 'status',
    dataIndex: 'status',
    width: 90,
  },
  {
    title: 'updatedAt',
    dataIndex: 'updatedAt',
    width: 160,
  },
  {
    title: 'createdAt',
    dataIndex: 'createdAt',
    width: 160,
  },
  {
    title: 'Operations',
    dataIndex: 'editPassword',
    fixed: 'right',
    width: 90,
    colSpan: 2,
  },
  {
    title: '',
    dataIndex: 'delete',
    fixed: 'right',
    width: 90,
    colSpan: 0,
  },
];
const userDataList = reactive({
  loading: false,
  data: [],
  curPage: 1,
  pageSize: 10,
  total: 0,
  username: '',
});
const searchInput = ref();
async function http(request) {

  let {method, url, params, data} = request;
  let res;
  if (params) {
    let s = new URLSearchParams(params).toString();
    url += '?' + s;
  }
  if (data) {
    console.log(data);
    res = await fetch(url, {
      method: method,
      headers: {
        'Content-Type':'application/json'
      },
      body: JSON.stringify(data),
      mode: "cors",
    });
  } else {
    res = await fetch(url);
  }
  return res.json();
}
// 发送请求获取数据
const fetchUserList = async () => {
  userDataList.loading = true;
  try {
    let result = await http({
      method: 'GET',
      url: 'http://localhost:8081/user/page',
      params: {
        page: userDataList?.curPage,
        count: userDataList?.pageSize,
        name: userDataList?.username,
      }
    });
    userDataList.data = result?.data;
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    userDataList.loading = false;
  }
};

const fetchUserCount = async () => {
  try {
    let result = await http({
      method: 'GET',
      url: 'http://localhost:8081/user/count',
      params: {
        username: userDataList.username,
        like: userDataList.username != '',
      }
    });
    userDataList.total = result?.data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

const pageChange = (current: number) => {
  userDataList.curPage = current;
  fetchUserList();
};

const pageSizeChange = (current: number, pageSize: number) => {
  userDataList.pageSize = pageSize;
  fetchUserList();
};

const usernameSearch = (selectedKeys, confirm) => {
  confirm();
  userDataList.username = selectedKeys[0];
  fetchUserCount();
  fetchUserList();
};

const usernameSearchReset = clearFilters => {
  clearFilters({ confirm: true });
  userDataList.username = '';
  fetchUserCount();
  fetchUserList();
};

// 在组件挂载后发送请求
onMounted(() => {
  fetchUserCount();
  fetchUserList();
});

interface UserData {
  id: number,
  username: string,
  account: string,
  password: string,
  phone: string,
  email: string,
  gender: number,
  role: number,
  status: number,
}
const addFormRef = ref<FormInstance>();
const editPasswordFormRef = ref<FormInstance>();
const addFormVisible = ref(false);
const editPasswordFormVisible = ref(false);
const addFormData = reactive<UserData>({
  id: null,
  username: '',
  account: '',
  password: '',
  checked: '',
  phone: '',
  email: '',
  gender: 0,
  granted: 0,
  status: 0,
});
interface checkedPassword {
  password: string,
  checked: string,
}
const editPasswordFormData = reactive<checkedPassword>({
  password: '',
  checked: '',
})
const postAddUser = async (user: UserData) => {
  try {
    let result = await http({
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
      }
    });

    if (result.status != 200) {
      console.error('Error adding user:', result?.msg)
    } else {
      userDataList.total++;
    }
  } catch (error) {
    console.error('Error adding user:', error);
  }
};
const onAddFormOk = () => {
  addFormRef.value.validateFields()
      .then(values => {
        values.status = Number(values.status);
        values.gender = Number(values.gender);
        values.role = Number(values.role);
        postAddUser(values);
        addFormVisible.value = false;
        addFormRef.value.resetFields();
      }).catch(error => {
        console.log('Validate Failed:', error);
      });
};
const onEditPasswordFormOk = (id: number) => {
  console.log(id);
  editPasswordFormRef.value.validateFields()
      .then(values => {
        let editUserData: UserData = {
          id: Number(id),
          username: '',
          account: '',
          password: values.password,
          phone: '',
          email: '',
          gender: 0,
          role: 0,
          status: 0,
        };
        postEditUser(editUserData);
        editPasswordFormVisible.value = false;
        editPasswordFormRef.value.resetFields();
      }).catch(error => {
        console.log('Validate Failed:', error);
      });
};

const postEditUser = async (user: UserData) => {
  try {
    let result = await http({
      method: 'post',
      url: 'http://localhost:8081/user/update',
      data: {
        id: user.id,
        account: user.account,
        username: user.username,
        password: user.password,
        phone: user.phone,
        email: user.email,
        role: user.role,
        status: user.status,
        gender: user.gender,
      }
    });

    if (result.status != 200) {
      console.error('Error adding user:', result?.msg);
    } else {
      await fetchUserList();
    }
  } catch (error) {
    console.error('Error adding user:', error);
  }
}
class editRecord {
  'username': string
  'account': string
  'password': string
  'phone': string
  'email': string
  'gender': number
  'role': number
  'status': number
}
const editableData: UnwrapRef<Record<number, editRecord>> = reactive({});
const edit = (id: number, key: string, val: string | number) => {
  if (!editableData[id]) {
    editableData[id] = new editRecord();
  }
  editableData[id][key] = val;
};
const save = (id: number, key: string) => {
  let editUserData: UserData = {
    id: id,
    username: '',
    account: '',
    password: '',
    phone: '',
    email: '',
    gender: 0,
    role: 0,
    status: 0,
  }
  if (key === 'username') {
    editUserData.username = editableData[id][key];
  } else if (key === 'password') {
    editUserData.password = editUserData[id][key];
  }
  console.log(editUserData);
  postEditUser(editUserData);
  delete editableData[id][key];
};
const postDeleteUser = async (id: number) => {
  try {
    let result = await http({
      method: 'post',
      url: 'http://localhost:8081/user/delete',
      data: {
        id: id,
      }
    });
    if (result.status != 200) {
      console.error('Error adding user:', result?.msg);
    } else {
      userDataList.total--;
      await fetchUserList();
    }
  } catch (error) {
    console.error('Error adding user:', error);
  }
}
const onDelete = (id: number) => {
  postDeleteUser(id);
};
</script>
<style>
body {
  background-color: #f0f0f0; /* 设置背景色 */
}

.title {
  display: flex;
  justify-content: space-between;
}

.listTitle {
  text-align: center;
  flex: 1;
}

.listTotal {
  text-align: right;
}

.listBottom {
  display: flex;
  justify-content: space-between;
}

.addUserButton {
  text-align: left;
}

.pagination {
  text-align: right;
}

.collection-create-form_last-form-item {
  margin-bottom: 0;
}

.editable-cell {
  position: relative;
  .editable-cell-input-wrapper,
  .editable-cell-text-wrapper {
    padding-right: 24px;
  }

  .editable-cell-text-wrapper {
    padding: 5px 24px 5px 5px;
  }

  .editable-cell-icon,
  .editable-cell-icon-check {
    position: absolute;
    right: 0;
    width: 20px;
    cursor: pointer;
  }

  .editable-cell-icon {
    margin-top: 4px;
    display: none;
  }

  .editable-cell-icon-check {
    line-height: 28px;
  }

  .editable-cell-icon:hover,
  .editable-cell-icon-check:hover {
    color: #108ee9;
  }

  .editable-add-btn {
    margin-bottom: 8px;
  }
}
.editable-cell:hover .editable-cell-icon {
  display: inline-block;
}
</style>
