<template>
  <context-holder />
  <div>
    <a-page-header title="Users">
      <template #tags>
        <a-tag color="blue">total: {{userDataList.total}}</a-tag>
      </template>
      <template #extra>
        <a-button key="1" type="primary" @click="onLogoutClick">Log out</a-button>
      </template>
    </a-page-header>
    <a-table :columns="columns" :dataSource="userDataList.data" :loading="userDataList.loading"
             :pagination="false" :scroll="{ x: 1600, y: 425 }" style="width: 1200px"
    >
      <template #customFilterDropdown="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }">
        <div style="padding: 8px">
          <!--placeholder:设置文本框提示文本 change:文本改变时 pressEnter:确认按钮-->
          <a-input
              ref="searchInput"
              :value="selectedKeys[0]"
              :placeholder="`Search by ${column.dataIndex}`"
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
          <div class="editable-cell" v-if="adminAuth">
            <div v-if="editableData[record.id] && editableData[record.id][column.title]" class="editable-cell-input-wrapper">
              <a-input v-model:value="editableData[record.id].username" @pressEnter="save(record.id, 'username')" />
              <check-outlined class="editable-cell-icon-check" @click="save(record.id, 'username')" />
            </div>
            <div v-else class="editable-cell-text-wrapper">
              {{ text}}
              <edit-outlined v-if="adminAuth" class="editable-cell-icon" @click="edit(record.id, 'username', text)" />
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
            <a-button type="text" @click="onEditPassword(record.id)">Edit Pass</a-button>
        </template>
      </template>

    </a-table>
    <div class="listBottom">
      <div class="addUserButton" v-if="adminAuth">
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
    <a-modal v-model:open="editPasswordFormVisible" title="Edit password" @ok="onEditPasswordFormOk(editPasswordId)">
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
<script lang="ts" setup>
import { reactive, onMounted, ref, computed, onBeforeMount } from 'vue';
import type { UnwrapRef } from 'vue';
import { Table, Pagination, FormInstance, message } from 'ant-design-vue';
import { SearchOutlined, CheckOutlined, EditOutlined } from '@ant-design/icons-vue';
import type { Rule } from 'ant-design-vue/es/form';

// import AddForm from '@/components/AddForm.vue'

import userPage from '@/apis/user/page.ts';
import userCount from '@/apis/user/count.ts';
import { userAdd, UserAddDTO } from '@/apis/user/add.ts'
import userDelete from '@/apis/user/delete.ts';
import userCheckAccountUnique from '@/apis/user/accountUnique.ts'
import { userUpdate, UserUpdateDTO } from '@/apis/user/update.ts';
import { useRouter } from 'vue-router';
const [messageApi, contextHolder] = message.useMessage();
const router = useRouter();

const adminAuth = computed(() => {
  return localStorage.getItem('role') === 'admin';
});

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
  let res = await userCheckAccountUnique(value);
  if (res) {
    return Promise.resolve();
  } else {
    return Promise.reject('This account has been used!');
  }
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
    title: 'Id',
    dataIndex: 'id',
    width: 100,
    fixed: 'left',
  },
  {
    title: 'Account',
    dataIndex: 'account',
    width: 150,
    ellipsis: true,
  },
  {
    title: 'Username',
    dataIndex: 'username',
    width: 150,
    customFilterDropdown: true,
    ellipsis: true,
  },
  {
    title: 'Gender',
    dataIndex: 'gender',
    width: 90,
  },
  {
    title: 'Email',
    dataIndex: 'email',
    width: 200,
    ellipsis: true,
  },
  {
    title: 'Phone',
    dataIndex: 'phone',
    width: 120,
    ellipsis: true,
  },
  {
    title: 'Role',
    dataIndex: 'role',
    width: 90,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    width: 90,
  },
  {
    title: 'UpdatedAt',
    dataIndex: 'updatedAt',
    width: 160,
  },
  {
    title: 'CreatedAt',
    dataIndex: 'createdAt',
    width: 160,
  },
  {
    title: 'Operations',
    dataIndex: 'editPassword',
    fixed: 'right',
    width: 90,
    colSpan: 2,
    hidden: !adminAuth.value,
  },
  {
    title: '',
    dataIndex: 'delete',
    fixed: 'right',
    width: 90,
    colSpan: 0,
    hidden: !adminAuth.value,
  },
].filter(v => !v?.hidden);
const userDataList = reactive({
  loading: false,
  data: [],
  curPage: 1,
  pageSize: 10,
  total: 0,
  username: '',
});
const searchInput = ref();
// 发送请求获取数据
const fetchUserList = async () => {
  userDataList.loading = true;
  await userPage(userDataList.username ? userDataList.username : '', userDataList.curPage, userDataList.pageSize).then(res => {
    userDataList.data = res;
  }).catch(error => {
    messageApi.error(error, 2.5);
  }).then(() => {
    userDataList.loading = false;
  });
};
const fetchUserCount = async () => {
  await userCount(userDataList.username).then(res => {
    userDataList.total = res;
  }).catch(error => {
    messageApi.error(error, 2.5);
  })
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
  // console.log(localStorage.getItem('token'));
  messageApi.success('Welcome!', 2);
});

const editPasswordFormRef = ref<FormInstance>();
const editPasswordFormVisible = ref(false);
const addFormRef = ref<FormInstance>();
const addFormVisible = ref(false);
const addFormData = reactive<UserAddDTO>({
  id: null,
  username: '',
  account: '',
  password: '',
  checked: '',
  phone: '',
  email: '',
  gender: 0,
  role: 0,
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
const onAddFormOk = () => {
  console.log(addFormRef.value);
  addFormRef.value.validateFields()
      .then(values => {
        values.status = Number(values.status);
        values.gender = Number(values.gender);
        values.role = Number(values.role);
        userAdd(values).then(() => {
          messageApi.success('Add success!', 2);
          fetchUserList();
          userDataList.total++;
        }).catch(error => {
          messageApi.error(error, 2);
          if (error == "Forbidden") {
            setTimeout(() => location.reload(), 2000);
          }
        });
      }).then(() => {
    addFormVisible.value = false;
    addFormRef.value.resetFields();
  });
};
let editPasswordId;
const onEditPassword = (id: number) => {
  editPasswordId = id;
  editPasswordFormVisible.value = true;
}
const onEditPasswordFormOk = (id: number) => {
  console.log("edit pass id: ", id);
  editPasswordFormRef.value.validateFields()
      .then(values => {
        let editUserData: UserUpdateDTO = {
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
        userUpdate(editUserData).then(() => {
          messageApi.success('Update success!', 2);
        }).catch(error => {
          if (error == "Forbidden") {
            setTimeout(() => location.reload(), 2000);
          }
          messageApi.error(error, 2);
        }).finally(() => {
          editPasswordFormVisible.value = false;
          editPasswordFormRef.value.resetFields();
        });
      });
};
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
  let editUserData: UserUpdateDTO = {
    id: id,
    username: '',
    account: '',
    password: '',
    phone: '',
    email: '',
    gender: 0,
    role: 0,
    status: 0,
  };
  if (key === 'username') {
    editUserData.username = editableData[id][key];
  } else if (key === 'password') {
    editUserData.password = editUserData[id][key];
  }
  userUpdate(editUserData).then(() => {
    fetchUserList();
    messageApi.success('Update success!', 2);
  }).catch(error => {
    messageApi.error(error, 2);
    if (error == "Forbidden") {
      setTimeout(() => location.reload(), 2000);
    }
  }).finally(() => {
    delete editableData[id][key];
  });
};
const onDelete = (id: number) => {
  userDelete(id).then(() => {
    messageApi.success('Delete success！', 2);
    userDataList.total--;
    fetchUserList();
  }).catch(error => {
    messageApi.error(error, 2);
    if (error == "Forbidden") {
      setTimeout(() => location.reload(), 2000);
    }
  });
};

const onLogoutClick = async () => {
  console.log("log out done!");
  localStorage.removeItem('role');
  router.push('/login');
}

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

  .editable-cell-icon {
    position: absolute;
    right: 0;
    width: 20px;
    cursor: pointer;
  }

  .editable-cell-icon {
    margin-top: 4px;
    display: none;
  }

  .editable-cell-icon:hover {
    color: #108ee9;
  }
}
.editable-cell:hover .editable-cell-icon {
  display: inline-block;
}
</style>
