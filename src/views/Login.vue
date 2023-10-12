<template>
  <context-holder />
  <a-form ref="loginFormRef" :model="loginForm" name="loginForm" class="login-form" @finish="onLoginOk" layout="vertical">
    <a-form-item label="Account" name="account" :rules="[{ required: true, message: 'Please input your account!' }]">
      <a-input v-model:value="loginForm.account" allow-clear>
        <template #prefix>
          <UserOutlined class="site-form-item-icon" />
        </template>
      </a-input>
    </a-form-item>

    <a-form-item label="Password" name="password" :rules="[{ required: true, message: 'Please input your password!' }]">
      <a-input-password v-model:value="loginForm.password" allow-clear>
        <template #prefix>
          <LockOutlined class="site-form-item-icon" />
        </template>
      </a-input-password>
    </a-form-item>

    <a-form-item>
      <div style="display: flex; justify-content: space-between">
        <a-form-item name="remember" no-style>
          <a-checkbox v-model:checked="loginForm.remember">Remember me</a-checkbox>
        </a-form-item>
<!--        <a class="login-form-forgot" href="" style="text-align: right; color: dodgerblue">Forgot password</a>-->
      </div>
    </a-form-item>

    <a-form-item >
      <div class="login-and-register" style="justify-content: space-evenly; display: flex">
        <a-button :disabled="!loginAble" type="primary" html-type="submit" class="login-form-button">Log in</a-button>

        <div class="regUserButton">
          <a-button type="primary" class="login-form-button" @click="regFormVisible = true">Register</a-button>
          <a-modal v-model:open="regFormVisible" title="Create a new account" ok-text="Create" cancel-text="Cancel" @ok="onRegFormOk">
            <a-form ref="regFormRef" :model="regFormData" layout="vertical" name="regForm" :rules="regFormRules" :label-col="{ span: 7 }" :wrapper-col="{ span: 14 }">

              <a-form-item name="account" label="Account">
                <a-input v-model:value="regFormData.account" />
              </a-form-item>

              <a-form-item name="username" label="Username">
                <a-input v-model:value="regFormData.username" />
              </a-form-item>

              <a-form-item name="password" label="Password">
                <a-input-password v-model:value="regFormData.password" autocomplete="off" allow-clear />
              </a-form-item>

              <a-form-item name="checked" label="Password Again">
                <a-input v-model:value="regFormData.checked" type="password" autocomplete="off" allow-clear />
              </a-form-item>

              <a-form-item name="phone" label="Phone">
                <a-input v-model:value="regFormData.phone" />
              </a-form-item>

              <a-form-item name="email" label="Email">
                <a-input v-model:value="regFormData.email" />
              </a-form-item>

              <a-form-item name="gender" label="Gender">
                <a-radio-group v-model:value="regFormData.gender">
                  <a-radio value=1>Male</a-radio>
                  <a-radio value=2>Female</a-radio>
                </a-radio-group>
              </a-form-item>

            </a-form>
          </a-modal>
        </div>
      </div>
    </a-form-item>
  </a-form>
</template>

<script lang="ts" setup>
import { reactive, computed, ref, onMounted } from 'vue';
import { FormInstance, message } from 'ant-design-vue';
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue';
import { useRouter } from 'vue-router';
import type { Rule } from 'ant-design-vue/es/form';

import userLogin from '@/apis/user/login.ts'
import { userRegister, UserRegisterDTO } from '@/apis/user/register.ts'
import userCheckAccountUnique from '@/apis/user/accountUnique.ts'

const [messageApi, contextHolder] = message.useMessage();
const router = useRouter();


const loginAble = computed(() => {
  return loginForm.account && loginForm.password;
});
const regFormRef = ref<FormInstance>();
const regFormVisible = ref(false);
const regFormData = reactive<UserRegisterDTO>({
  id: null,
  username: '',
  account: '',
  password: '',
  checked: '',
  phone: '',
  email: '',
  gender: 0,
  role: 2,
  status: 1,
});
const checkPasswordAgain = async (_rule: Rule, value: string) => {
  if (value === '') {
    return Promise.reject();
  } else if (value !== regFormData.password) {
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
const regFormRules: Record<string, Rule[]> = {
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
const onRegFormOk = () => {
  regFormRef.value.validateFields()
      .then(values => {
        values.status = Number(values.status);
        values.gender = Number(values.gender);
        values.role = Number(values.role);
        userRegister(values).then(() => {
            messageApi.success('Register success!', 2);
        }).catch(error => {
            messageApi.error('Register failed!' + error, 2);
        });
        regFormVisible.value = false;
        regFormRef.value.resetFields();
      });
};

interface LoginForm {
  account: string;
  password: string;
  remember: boolean;
}
const loginFormRef = ref<FormInstance>();
const loginForm = reactive<LoginForm>({
  account: '',
  password: '',
  remember: false,
});
const onLoginOk = () => {
  loginFormRef.value.validateFields()
      .then((values) => {
          userLogin(values.account, values.password).then(res => {
            console.log("post login done!");
            localStorage.setItem('role', res.role);
            if (values.remember) {
              localStorage.setItem('account', values.account);
            }
            router.push('/userList');
        }).catch(error => {
          console.log("login post done err: ", error);
            messageApi.error(error);
        })
      });
};

onMounted(() => {
  loginForm.account = localStorage.getItem('account');
});
</script>

<style scoped>
</style>
