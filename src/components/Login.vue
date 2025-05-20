<template>
  <v-app>
    <v-main>
      <v-container fluid fill-height>
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="4">            
            <v-card width="400" class="mx-auto mt-5">
              <v-card-title class="pb-0">
                <h1>Login</h1>
              </v-card-title>
              <v-card-text>
                <v-form @submit.prevent="autenticar">
                  <v-text-field 
                    label="Usuário" 
                    prepend-icon="mdi-account-circle"
                    v-model="username"
                    required
                    class="rounded-0"
                  />
                  <v-text-field 
                    :type="showPassword ? 'text' : 'password'" 
                    label="Senha"
                    prepend-icon="mdi-lock"
                   :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                   @click:append="showPassword = !showPassword"
                    v-model="password"
                    required
                  />
                  <v-alert
                    v-if="error"
                    type="error"
                    dense
                    class="mt-1"
                  >
                    Usuário ou senha inválidos.
                  </v-alert>
                  <v-alert
                    v-if="success"
                    type="success"
                    dense
                    class="mt-2"
                  >
                    Login realizado com sucesso!
                  </v-alert>
                </v-form>
              </v-card-text>
              <v-divider></v-divider>
              <v-card-actions>
                <v-btn color="info" @click="autenticar">Login</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      showPassword: false,
      username: '',
      password: '',
      error: false,
      success: false,
      // Usuários e senhas em texto plano para MVP
      users: [
        { username: 'teste', password: 'teste' },
        { username: 'a', password: 'a' }
      ]
    };
  },
  methods: {
    autenticar() {
      const usuarioValido = this.users.find(
        user =>
          user.username === this.username &&
          user.password === this.password
      );
      if (usuarioValido) {
        this.error = false;
        this.success = true;
        this.$router.push('/tipoinsercao'); // Redireciona para a próxima tela
            } else {
        this.success = false;
        this.error = true;
      }
    }
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

