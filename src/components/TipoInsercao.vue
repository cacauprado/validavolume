<template>
  <v-app>
    <v-container fluid>
      <v-row justify="center">
        <v-col cols="12" sm="10" md="8" lg="6">
          <v-card class="mt-8 pa-6" elevation="3">
            <v-card-title class="text-h5 font-weight-medium justify-center">
              Selecione os dados para inserção
            </v-card-title>

            <v-card-text>
              <!-- Renderiza o select só após carregar os projetos -->
              <v-select
                v-if="projetos.length"
                v-model="projetosSelecionados"
                :items="projetos"
                label="Selecione os projetos"
                multiple
                chips
                outlined
                dense
                class="mb-4"
              />

              <!-- Seleção de Mês e Ano -->
              <v-row dense>
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="mesesSelecionados"
                    :items="listaMeses"
                    label="Mês"
                    multiple
                    chips
                    outlined
                    dense
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="anoSelecionado"
                    :items="listaAnos"
                    label="Ano"
                    outlined
                    dense
                  />
                </v-col>
              </v-row>

              <!-- Botões -->
              <v-row class="mt-6" justify="center" dense>
                <v-col cols="12" sm="6" class="text-center mb-2">
                  <v-btn
                    color="primary"
                    large
                    block
                    :disabled="!projetosSelecionados.length || !mesesSelecionados.length || !anoSelecionado"
                    @click="irParaInsercaoManual"
                  >
                    Inserção Manual
                  </v-btn>
                </v-col>
                <v-col cols="12" sm="6" class="text-center">
                  <v-btn
                    color="secondary"
                    large
                    block
                    :disabled="!projetosSelecionados.length || !mesesSelecionados.length || !anoSelecionado"
                    @click="irParaInsercaoTemplate"
                  >
                    Inserir por Template
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>
import * as XLSX from 'xlsx';

export default {
  name: 'TipoInsercao',
  data() {
    return {
      projetos: [],
      projetosSelecionados: [],
      listaMeses: [
        'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
        'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
      ],
      mesesSelecionados: [],
      listaAnos: [2025, 2026],
      anoSelecionado: null
    };
  },
  mounted() {
    this.carregarProjetosDoExcel();
  },
  methods: {
    async carregarProjetosDoExcel() {
      try {
        const response = await fetch('/base_projetos.xlsx');
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        const projetosSet = new Set();
        jsonData.forEach(row => {
          if (row['Projeto']) {
            projetosSet.add(row['Projeto']);
          }
        });
        this.projetos = Array.from(projetosSet);
      } catch (error) {
        alert('Erro ao carregar a base de projetos. Verifique se o arquivo base_projetos.xlsx está na pasta public.');
      }
    },
    irParaInsercaoManual() {
      localStorage.setItem('projetosSelecionados', JSON.stringify(this.projetosSelecionados));
      localStorage.setItem('mesesSelecionados', JSON.stringify(this.mesesSelecionados));
      localStorage.setItem('anoSelecionado', this.anoSelecionado);
      this.$router.push('/insermanual');
    },
    irParaInsercaoTemplate() {
      localStorage.setItem('projetosSelecionados', JSON.stringify(this.projetosSelecionados));
      localStorage.setItem('mesesSelecionados', JSON.stringify(this.mesesSelecionados));
      localStorage.setItem('anoSelecionado', this.anoSelecionado);
      this.$router.push('/insertemplate');
    }
  }
};
</script>
