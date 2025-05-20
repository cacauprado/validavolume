<template>
  <v-app>
    <v-container fluid>
      <v-row justify="center">
        <v-col cols="12" sm="11" md="10">
          <v-card class="mt-8 pa-6" elevation="3">
            <!-- Header -->
            <div class="d-flex justify-space-between align-center mb-4">
              <v-btn icon @click="$router.push('/')" aria-label="Voltar para página inicial">
                <v-icon>mdi-home</v-icon>
              </v-btn>
              <h2 class="text-h5 font-weight-medium">Preenchimento Manual de Projetos</h2>
            </div>

            <v-card-text>
              <v-overlay :value="carregando" absolute>
                <v-progress-circular indeterminate size="64"></v-progress-circular>
              </v-overlay>

              <div v-if="!carregando && projetosSelecionados.length && mesesSelecionados.length">
                <div v-for="projeto in projetosSelecionados" :key="projeto" class="mb-10">
                  <h3 class="text-h6 mb-4 d-flex align-center">{{ projeto }}</h3>
                  <v-simple-table dense class="bordered-table">
                    <thead>
                      <tr>
                        <th class="table-header">Processo</th>
                        <th class="table-header">Valor Unitário</th>
                        <th
                          v-for="mes in mesesSelecionados"
                          :key="mes"
                          class="table-header"
                          :aria-label="`Coluna para ${mes} de ${anoSelecionado}`"
                        >
                          {{ mes }} / {{ anoSelecionado }}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="processo in processosPorProjeto[projeto] || []" :key="processo.nome">
                        <td>{{ processo.nome }}</td>
                        <td class="text-right">{{ formatarNumero(processo.valor) }}</td>
                        <td
                          v-for="mes in mesesSelecionados"
                          :key="mes"
                          class="text-right"
                        >
                          <!-- Mudança aqui: usando v-model diretamente -->
                          <v-text-field
                            v-model="dados[projeto][processo.nome][mes].volume"
                            :label="`Volume para ${processo.nome} em ${mes}`"
                            type="number"
                            dense
                            hide-details
                            class="volume-field"
                            min="0"
                            max="999999"
                            maxlength="6"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </v-simple-table>
                </div>

                <!-- Botões de ação -->
                <v-row class="mt-6" justify="center" dense>
                  <v-col cols="12" sm="6" md="3" class="text-center mb-2">
                    <v-btn
                      color="info"
                      block
                      @click="executarCalculo"
                      aria-label="Calcular totais dos projetos"
                      :disabled="semDadosValidos"
                    >
                      Calcular
                    </v-btn>
                  </v-col>
                  <v-col cols="12" sm="6" md="3" class="text-center">
                    <v-btn
                      color="success"
                      block
                      @click="baixarBases"
                      aria-label="Baixar bases atualizadas em Excel"
                      :disabled="semDadosValidos"
                    >
                      Baixar base atualizada
                    </v-btn>
                  </v-col>
                </v-row>
              </div>

              <v-alert v-if="!carregando && (!projetosSelecionados.length || !mesesSelecionados.length)" type="warning" dense class="mt-4">
                Selecione projetos e meses na tela inicial.
              </v-alert>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Modal de totais -->
<v-dialog v-model="exibirTotais" max-width="720" persistent>
  <v-card class="rounded-xl elevation-10">
    <div class="d-flex justify-space-between align-center px-5 pt-5">
      <span class="text-h6 font-weight-bold">Resumo</span>
      <v-btn icon @click="exibirTotais = false" aria-label="Fechar modal">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>
    <v-card-text class="pt-2 px-5 pb-0">
      <v-simple-table class="styled-table mt-3">
        <thead>
          <tr>
            <th class="text-left">Projeto</th>
            <th v-for="mes in mesesSelecionados" :key="mes" class="text-right">
              {{ mes }} / {{ anoSelecionado }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="projeto in projetosSelecionados" :key="projeto">
            <td>
              <v-icon small color="primary" class="mr-2">mdi-folder</v-icon>
              {{ projeto }}
            </td>
            <td
              v-for="mes in mesesSelecionados"
              :key="mes"
              class="text-right"
            >
              {{ formatarNumero(resultadoCalculo[projeto]?.[mes] || 0) }}
            </td>
          </tr>
        </tbody>
      </v-simple-table>
    </v-card-text>
    <v-card-actions class="justify-end px-5 pb-4">
      <v-btn color="primary" dark @click="baixarBases" aria-label="Exportar planilhas">
        <v-icon left>mdi-download</v-icon>
        Exportar
      </v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>
        <!-- Fim do modal de totais -->

      <!-- Snackbar para feedback -->
      <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="4000">
        {{ snackbarMessage }}
        <template v-slot:action="{ attrs }">
          <v-btn text v-bind="attrs" @click="snackbar = false">
            Fechar
          </v-btn>
        </template>
      </v-snackbar>
    </v-container>
  </v-app>
</template>

<script>
import * as XLSX from 'xlsx';
import { ref } from 'vue';

export default {
  name: 'InsManual',
  setup() {
    // Composable: useProjetoCalculos
    const resultadoCalculo = ref({});
    function formatarNumero(valor) {
      return Number(valor).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
    function calcularTotais(dados, processosPorProjeto, projetosSelecionados, mesesSelecionados) {
      const resultado = {};
      projetosSelecionados.forEach(projeto => {
        resultado[projeto] = {};
        mesesSelecionados.forEach(mes => {
          let total = 0;
          (processosPorProjeto[projeto] || []).forEach(processo => {
            const nomeProc = processo.nome;
            const valorUnit = processo.valor;
            const volume = Number(dados[projeto]?.[nomeProc]?.[mes]?.volume) || 0;
            total += valorUnit * volume;
          });
          resultado[projeto][mes] = total;
        });
      });
      resultadoCalculo.value = resultado;
      return resultado;
    }
    return {
      resultadoCalculo,
      calcularTotais,
      formatarNumero
    };
  },
  data() {
    const projetosSelecionados = JSON.parse(localStorage.getItem('projetosSelecionados')) || [];
    const mesesSelecionados = JSON.parse(localStorage.getItem('mesesSelecionados')) || [];
    const anoSelecionado = localStorage.getItem('anoSelecionado') || '';
    return {
      projetosSelecionados,
      mesesSelecionados,
      anoSelecionado,
      processosPorProjeto: {},
      dados: {},
      exibirTotais: false,
      carregando: true,
      snackbar: false,
      snackbarMessage: '',
      snackbarColor: 'success'
    };
  },
  computed: {
    semDadosValidos() {
      if (!this.projetosSelecionados.length || !this.mesesSelecionados.length || !Object.keys(this.processosPorProjeto).length) {
        return true;
      }
      return !this.projetosSelecionados.some(projeto =>
        (this.processosPorProjeto[projeto] || []).some(processo =>
          this.mesesSelecionados.some(mes =>
            Number(this.dados[projeto]?.[processo.nome]?.[mes]?.volume || 0) > 0
          )
        )
      );
    }
  },
  async mounted() {
    this.carregando = true;
    try {
      await this.carregarProcessosProjetos();
      this.inicializarDados();
    } catch (error) {
      this.mostrarAlerta('Erro ao carregar dados iniciais. Tente novamente.', 'error');
    } finally {
      this.carregando = false;
    }
  },
  methods: {
    async carregarProcessosProjetos() {
      try {
        const response = await fetch('/base_projetos.xlsx');
        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        const processosMap = {};
        jsonData.forEach(row => {
          const projeto = row['Projeto'];
          const processo = row['Processo'];
          const valor = Number(row['Valor_unitario']);
          if (projeto && processo && !isNaN(valor)) {
            if (!processosMap[projeto]) {
              processosMap[projeto] = [];
            }
            processosMap[projeto].push({ nome: processo, valor });
          }
        });
        this.processosPorProjeto = processosMap;
      } catch (error) {
        console.error('Erro ao carregar base de projetos:', error);
        this.mostrarAlerta(
          `Não foi possível carregar a base de projetos. Detalhe: ${error.message}`,
          'error'
        );
        throw error;
      }
    },
    inicializarDados() {
      const novosDados = {};
      this.projetosSelecionados.forEach(proj => {
        if (!this.processosPorProjeto[proj] || this.processosPorProjeto[proj].length === 0) {
          return;
        }
        novosDados[proj] = {};
        this.processosPorProjeto[proj].forEach(processo => {
          novosDados[proj][processo.nome] = {};
          this.mesesSelecionados.forEach(mes => {
            const valorExistente = this.dados[proj]?.[processo.nome]?.[mes]?.volume;
            novosDados[proj][processo.nome][mes] = { volume: (valorExistente !== undefined ? valorExistente : '') };
          });
        });
      });
      this.dados = novosDados;
    },
    
   
    executarCalculo() {
  this.calcularTotais(this.dados, this.processosPorProjeto, this.projetosSelecionados, this.mesesSelecionados);
  this.exibirTotais = true; // Certifique-se que esta linha está presente
},
    baixarBases() {
      try {
        let contadorArquivos = 0;
        this.projetosSelecionados.forEach(projeto => {
          if (!this.processosPorProjeto[projeto]) return;
          this.mesesSelecionados.forEach(mes => {
            const linhas = [];
            let temDadosNesteArquivo = false;
            this.processosPorProjeto[projeto].forEach(processo => {
              const nomeProc = processo.nome;
              const valorUnit = processo.valor;
              const volumeInput = this.dados[projeto]?.[nomeProc]?.[mes]?.volume;
              const volume = (volumeInput === '' || volumeInput === null || isNaN(Number(volumeInput))) ? 0 : Number(volumeInput);
              const total = valorUnit * volume;
              if (volume > 0) temDadosNesteArquivo = true;
              linhas.push({
                Projeto: projeto,
                Mês: `${mes}/${this.anoSelecionado}`,
                Processo: nomeProc,
                'Valor Unitário': valorUnit,
                Volume: volume,
                Total: total
              });
            });
            if (temDadosNesteArquivo) {
              const ws = XLSX.utils.json_to_sheet(linhas);
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, 'Projeção');
              const nomeProjetoSanitizado = projeto.replace(/[^a-zA-Z0-9_.-]/g, '_');
              const nomeArquivo = `projecao-${nomeProjetoSanitizado}-${mes}${this.anoSelecionado}.xlsx`;
              XLSX.writeFile(wb, nomeArquivo);
              contadorArquivos++;
            }
          });
        });
        if (contadorArquivos > 0) {
          this.mostrarAlerta(`${contadorArquivos} arquivo(s) exportado(s) com sucesso!`, 'success');
        } else {
          this.mostrarAlerta('Nenhum volume preenchido. Nenhum arquivo foi exportado.', 'warning');
        }
      } catch (error) {
        console.error('Erro ao exportar arquivos:', error);
        this.mostrarAlerta(`Erro ao exportar arquivos: ${error.message}`, 'error');
      }
    },
    mostrarAlerta(mensagem, cor = 'success') {
      this.snackbarMessage = mensagem;
      this.snackbarColor = cor;
      this.snackbar = true;
    }
  },
  watch: {
    projetosSelecionados: 'inicializarDados',
    mesesSelecionados: 'inicializarDados',
    processosPorProjeto: {
      handler: 'inicializarDados',
      deep: true
    }
  }
};
</script>

<style scoped>
.table-header {
  white-space: nowrap;
  text-align: center;
  font-weight: 500;
  padding: 8px;
  border-bottom: 1px solid #ccc;
}
.bordered-table td,
.bordered-table th {
  padding: 8px;
  border: 1px solid #e0e0e0;
}
.volume-field input::-webkit-outer-spin-button,
.volume-field input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.volume-field input[type=number] {
  -moz-appearance: textfield;
  appearance: textfield;
  text-align: right;
}
.styled-table {
  margin-top: 16px;
}
.styled-table th,
.styled-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
  font-size: 15px;
}
.styled-table th {
  background-color: #f5f7fa;
  font-weight: 600;
}
.table-responsive {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
</style>
