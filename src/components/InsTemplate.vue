<template>
  <v-app>
    <v-container>
      <v-card class="mx-auto mt-5" width="600">
        <v-btn icon @click="$router.push('/')">
            <v-icon>mdi-home</v-icon>
        </v-btn>
        <v-card-title>
          <h2>Inserção por Template</h2>
        </v-card-title>
        <v-card-text>
          <p>Esta tela será utilizada para inserção de dados via template Excel.</p>
          <v-alert type="info" dense>
            Funcionalidade em desenvolvimento.
          </v-alert>
        </v-card-text>
      </v-card>
    </v-container>
  </v-app>
</template>

<script>
export default {
  name: 'InsTemplate'
}
</script>
