```javascript
/* =========================================================
   SIGDH 5.0
   SCRIPT PRINCIPAL
   ========================================================= */

"use strict";

/* =========================================================
   CONFIGURAÇÕES
   ========================================================= */

const CONFIG = {
    registrosPorPagina: 15,

    colunasAnalise: [
        "A",
        "G",
        "I",
        "L",
        "P",
        "Q",
        "AD",
        "AE",
        "AM",
        "AV",
        "BB"
    ],

    classificacoes: [
        "MATERIAL",
        "MEDICAMENTO",
        "LOGISTICA",
        "COMPRA",
        "OPME"
    ],

    ofensores: [
        "FARMACIA",
        "LOGISTICA",
        "OPME",
        "MEDICAMENTO",
        "MATERIAL"
    ]
};


/* =========================================================
   ESTADO DO SISTEMA
   ========================================================= */

const estado = {

    dados: [],

    dadosFiltrados: [],

    paginaAtual: 1,

    arquivoAtual: null,

    ultimaAnalise: null,

    graficos: {},

    darkMode: false,

    filtros: {
        pesquisa: "",
        classificacao: "",
        operadora: "",
        prioridade: "",
        ofensor: ""
    }

};


/* =========================================================
   ELEMENTOS
   ========================================================= */

const $ = id => document.getElementById(id);

const qs = selector => document.querySelector(selector);

const qsa = selector => document.querySelectorAll(selector);


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    iniciarSistema();

});


function iniciarSistema() {

    carregarConfiguracoes();

    configurarNavegacao();

    configurarSidebar();

    configurarTema();

    configurarImportacao();

    configurarFiltros();

    configurarModal();

    configurarExportacao();

    configurarMotorAnalise();

    atualizarInterface();

    setTimeout(() => {

        const loading = $("loadingScreen");

        if (loading) {
            loading.classList.add("hidden");
        }

    }, 700);

}


/* =========================================================
   NAVEGAÇÃO
   ========================================================= */

function configurarNavegacao() {

    qsa(".menu-item").forEach(item => {

        item.addEventListener("click", () => {

            const section = item.dataset.section;

            navegarPara(section);

        });

    });

}


function navegarPara(sectionId) {

    const sections = qsa(".page-section");

    const menus = qsa(".menu-item");

    sections.forEach(section => {

        section.classList.remove("active");

    });

    menus.forEach(menu => {

        menu.classList.remove("active");

    });

    const section = $(sectionId);

    const menu = qs(`.menu-item[data-section="${sectionId}"]`);

    if (section) {

        section.classList.add("active");

    }

    if (menu) {

        menu.classList.add("active");

    }

    atualizarTitulo(sectionId);

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


function atualizarTitulo(sectionId) {

    const titulos = {

        dashboard: [
            "Dashboard",
            "Visão geral do sistema"
        ],

        demandas: [
            "Demandas",
            "Consulta e análise dos registros"
        ],

        motor: [
            "Motor de Análise",
            "Classificação automática das demandas"
        ],

        indicadores: [
            "Indicadores",
            "Indicadores de desempenho"
        ],

        ranking: [
            "Ranking",
            "Principais ofensores identificados"
        ],

        alertas: [
            "Alertas",
            "Demandas que precisam de atenção"
        ],

        importacao: [
            "Importação",
            "Importe sua planilha de demandas"
        ],

        exportacao: [
            "Exportação",
            "Exporte os resultados da análise"
        ],

        usuarios: [
            "Usuários",
            "Usuários autorizados"
        ],

        configuracoes: [
            "Configurações",
            "Preferências do sistema"
        ]

    };

    const info = titulos[sectionId] || titulos.dashboard;

    if ($("pageTitle")) {
        $("pageTitle").textContent = info[0];
    }

    if ($("pageSubtitle")) {
        $("pageSubtitle").textContent = info[1];
    }

}


/* =========================================================
   SIDEBAR
   ========================================================= */

function configurarSidebar() {

    const toggle = $("sidebarToggle");

    const sidebar = $("sidebar");

    const mobileMenu = $("mobileMenu");

    if (toggle && sidebar) {

        toggle.addEventListener("click", () => {

            sidebar.classList.toggle("collapsed");

        });

    }

    if (mobileMenu && sidebar) {

        mobileMenu.addEventListener("click", () => {

            sidebar.classList.toggle("mobile-open");

        });

    }

    qsa(".menu-item").forEach(item => {

        item.addEventListener("click", () => {

            if (window.innerWidth <= 992) {

                sidebar.classList.remove("mobile-open");

            }

        });

    });

}


/* =========================================================
   TEMA
   ========================================================= */

function configurarTema() {

    const themeToggle = $("themeToggle");

    const darkModeSetting = $("darkModeSetting");

    if (themeToggle) {

        themeToggle.addEventListener("click", alternarTema);

    }

    if (darkModeSetting) {

        darkModeSetting.addEventListener("change", e => {

            aplicarTema(e.target.checked);

        });

    }

    atualizarIconeTema();

}


function alternarTema() {

    aplicarTema(!estado.darkMode);

}


function aplicarTema(ativo) {

    estado.darkMode = ativo;

    document.body.classList.toggle(
        "dark-mode",
        ativo
    );

    localStorage.setItem(
        "sigdH_dark_mode",
        ativo ? "true" : "false"
    );

    const setting = $("darkModeSetting");

    if (setting) {
        setting.checked = ativo;
    }

    atualizarIconeTema();

}


function atualizarIconeTema() {

    const button = $("themeToggle");

    if (!button) return;

    const icon = button.querySelector("i");

    if (!icon) return;

    icon.className = estado.darkMode
        ? "fas fa-sun"
        : "fas fa-moon";

}


/* =========================================================
   CONFIGURAÇÕES
   ========================================================= */

function carregarConfiguracoes() {

    const tema = localStorage.getItem("sigdH_dark_mode");

    if (tema === "true") {

        estado.darkMode = true;

        document.body.classList.add("dark-mode");

    }

}


/* =========================================================
   IMPORTAÇÃO
   ========================================================= */

function configurarImportacao() {

    const input = $("inputExcel");

    const dropZone = $("arquivoExcel");

    if (!input || !dropZone) return;


    input.addEventListener("change", event => {

        const arquivo = event.target.files[0];

        if (arquivo) {

            processarArquivo(arquivo);

        }

    });


    dropZone.addEventListener("dragover", event => {

        event.preventDefault();

        dropZone.classList.add("dragover");

    });


    dropZone.addEventListener("dragleave", () => {

        dropZone.classList.remove("dragover");

    });


    dropZone.addEventListener("drop", event => {

        event.preventDefault();

        dropZone.classList.remove("dragover");

        const arquivo = event.dataTransfer.files[0];

        if (arquivo) {

            processarArquivo(arquivo);

        }

    });

}


async function processarArquivo(arquivo) {

    const extensao = arquivo.name
        .split(".")
        .pop()
        .toLowerCase();

    if (!["xlsx", "xls", "csv"].includes(extensao)) {

        mostrarToast(
            "Formato não suportado. Use XLSX, XLS ou CSV.",
            "error"
        );

        return;

    }

    estado.arquivoAtual = arquivo;

    mostrarProgresso(5, arquivo.name);

    try {

        const dados = await lerPlanilha(arquivo);

        mostrarProgresso(45, "Processando registros...");

        const registros = transformarDados(dados);

        mostrarProgresso(75, "Executando classificação...");

        estado.dados = registros;

        estado.dadosFiltrados = [...registros];

        estado.paginaAtual = 1;

        await aguardar(250);

        mostrarProgresso(100, "Importação concluída");

        salvarHistoricoImportacao(
            arquivo.name,
            registros.length
        );

        atualizarInterface();

        mostrarResultadoImportacao(
            arquivo.name,
            registros.length
        );

        mostrarToast(
            `${registros.length} demanda(s) importada(s) com sucesso.`,
            "success"
        );

        if ($("analiseAutomatica")?.checked) {

            executarAnalise();

        }

    } catch (erro) {

        console.error(erro);

        mostrarToast(
            "Não foi possível ler a planilha.",
            "error"
        );

        ocultarProgresso();

    }

}


function lerPlanilha(arquivo) {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onload = event => {

            try {

                const dados = new Uint8Array(
                    event.target.result
                );

                const workbook = XLSX.read(
                    dados,
                    {
                        type: "array",
                        cellDates: true
                    }
                );

                const primeiraAba =
                    workbook.SheetNames[0];

                if (!primeiraAba) {

                    reject(
                        new Error("Planilha sem abas.")
                    );

                    return;

                }

                const worksheet =
                    workbook.Sheets[primeiraAba];

                const json =
                    XLSX.utils.sheet_to_json(
                        worksheet,
                        {
                            header: 1,
                            defval: "",
                            raw: false
                        }
                    );

                resolve(json);

            } catch (erro) {

                reject(erro);

            }

        };

        reader.onerror = () => {

            reject(
                new Error("Erro ao ler arquivo.")
            );

        };

        reader.readAsArrayBuffer(arquivo);

    });

}


/* =========================================================
   TRANSFORMAÇÃO DOS DADOS
   ========================================================= */

function transformarDados(linhas) {

    if (!linhas || linhas.length === 0) {

        return [];

    }

    const primeiraLinha = linhas[0] || [];

    const possuiCabecalho = detectarCabecalho(primeiraLinha);

    const inicio = possuiCabecalho ? 1 : 0;

    const registros = [];

    for (let i = inicio; i < linhas.length; i++) {

        const linha = linhas[i];

        if (!linha || linha.every(v => String(v).trim() === "")) {
            continue;
        }

        const registro = criarRegistro(
            linha,
            i + 1
        );

        registros.push(registro);

    }

    return registros;

}


function detectarCabecalho(linha) {

    const texto = linha
        .map(v => normalizarTexto(v))
        .join(" ");

    const palavras = [
        "PROTOCOLO",
        "BENEFICIARIO",
        "RECLAMACAO",
        "PRESTADOR",
        "OPERADORA",
        "DATA"
    ];

    let encontrados = 0;

    palavras.forEach(palavra => {

        if (texto.includes(palavra)) {

            encontrados++;

        }

    });

    return encontrados >= 2;

}


/* =========================================================
   CRIAÇÃO DOS REGISTROS
   ========================================================= */

function criarRegistro(linha, numeroLinha) {

    const valorA = valorColuna(linha, "A");
    const valorG = valorColuna(linha, "G");
    const valorI = valorColuna(linha, "I");
    const valorL = valorColuna(linha, "L");
    const valorP = valorColuna(linha, "P");
    const valorQ = valorColuna(linha, "Q");
    const valorAD = valorColuna(linha, "AD");
    const valorAE = valorColuna(linha, "AE");
    const valorAM = valorColuna(linha, "AM");
    const valorAV = valorColuna(linha, "AV");
    const valorBB = valorColuna(linha, "BB");


    const textoAnalise = [
        valorA,
        valorG,
        valorI,
        valorL,
        valorP,
        valorQ,
        valorAD,
        valorAE,
        valorAM,
        valorAV,
        valorBB
    ]
        .map(v => normalizarTexto(v))
        .join(" ");


    const classificacao =
        classificarDemanda(textoAnalise);


    const ofensor =
        identificarOfensor(
            textoAnalise,
            classificacao
        );


    const prioridade =
        determinarPrioridade(textoAnalise);


    const confianca =
        calcularConfianca(
            textoAnalise,
            classificacao
        );


    return {

        id: numeroLinha,

        registro:
            valorA || String(numeroLinha),

        protocolo:
            valorG || "-",

        beneficiario:
            valorI || "-",

        data:
            valorL || "-",

        reclamacao:
            valorP || valorQ || "-",

        prestador:
            valorQ || valorAD || "-",

        operadora:
            valorAE || valorAM || "-",

        valorAV,

        valorBB,

        classificacao,

        ofensor,

        prioridade,

        confianca,

        status:
            "PENDENTE",

        textoAnalise

    };

}


/* =========================================================
   CONVERSÃO DE COLUNA
   ========================================================= */

function colunaParaIndice(coluna) {

    let resultado = 0;

    for (let i = 0; i < coluna.length; i++) {

        resultado =
            resultado * 26 +
            coluna.charCodeAt(i) -
            64;

    }

    return resultado - 1;

}


function valorColuna(linha, coluna) {

    const indice =
        colunaParaIndice(coluna);

    return linha[indice] !== undefined
        ? String(linha[indice]).trim()
        : "";

}


/* =========================================================
   CLASSIFICAÇÃO
   ========================================================= */

function classificarDemanda(texto) {

    const regras = {

        OPME: [
            "OPME",
            "PROTESE",
            "PRÓTESE",
            "ORTese",
            "ÓRTESE",
            "IMPLANTE",
            "STENT",
            "MATERIAL ESPECIAL"
        ],

        MEDICAMENTO: [
            "MEDICAMENTO",
            "REMÉDIO",
            "REMEDIO",
            "DROGA",
            "FARMACO",
            "FÁRMACO",
            "COMPRIMIDO",
            "INJEÇÃO",
            "INJECAO",
            "DOSE",
            "POSOLOGIA"
        ],

        MATERIAL: [
            "MATERIAL",
            "MATERIAL HOSPITALAR",
            "LUVA",
            "SERINGA",
            "GAZE",
            "CURATIVO",
            "CATETER",
            "EQUIPO",
            "DESCARTÁVEL",
            "DESCARTAVEL"
        ],

        LOGISTICA: [
            "LOGÍSTICA",
            "LOGISTICA",
            "ENTREGA",
            "ENTREGAR",
            "ATRASO",
            "TRANSPORTE",
            "ALMOXARIFADO",
            "ESTOQUE",
            "DISPONIBILIDADE",
            "SEPARAÇÃO",
            "SEPARACAO"
        ],

        COMPRA: [
            "COMPRA",
            "COMPRAR",
            "AQUISIÇÃO",
            "AQUISICAO",
            "COTAÇÃO",
            "COTACAO",
            "ORÇAMENTO",
            "ORCAMENTO",
            "PEDIDO DE COMPRA"
        ]

    };


    const pontuacao = {

        MATERIAL: 0,
        MEDICAMENTO: 0,
        LOGISTICA: 0,
        COMPRA: 0,
        OPME: 0

    };


    Object.entries(regras).forEach(
        ([categoria, palavras]) => {

            palavras.forEach(palavra => {

                const termo =
                    normalizarTexto(palavra);

                if (texto.includes(termo)) {

                    pontuacao[categoria]++;

                }

            });

        }
    );


    const ordenado =
        Object.entries(pontuacao)
            .sort((a, b) => b[1] - a[1]);


    if (ordenado[0][1] === 0) {

        return "MATERIAL";

    }


    return ordenado[0][0];

}


/* =========================================================
   OFENSOR
   ========================================================= */

function identificarOfensor(texto, classificacao) {

    const regras = {

        FARMACIA: [
            "FARMÁCIA",
            "FARMACIA",
            "FARMACÊUTICO",
            "FARMACEUTICO",
            "DISPENSAÇÃO",
            "DISPENSACAO"
        ],

        LOGISTICA: [
            "LOGÍSTICA",
            "LOGISTICA",
            "ENTREGA",
            "TRANSPORTE",
            "ALMOXARIFADO",
            "ESTOQUE"
        ],

        OPME: [
            "OPME",
            "PRÓTESE",
            "PROTESE",
            "ÓRTESE",
            "ORTESE",
            "IMPLANTE"
        ],

        MEDICAMENTO: [
            "MEDICAMENTO",
            "REMÉDIO",
            "REMEDIO",
            "FÁRMACO",
            "FARMACO"
        ],

        MATERIAL: [
            "MATERIAL",
            "LUVA",
            "SERINGA",
            "GAZE",
            "CATETER",
            "CURATIVO"
        ]

    };


    const pontos = {};

    CONFIG.ofensores.forEach(ofensor => {
        pontos[ofensor] = 0;
    });


    Object.entries(regras).forEach(
        ([ofensor, palavras]) => {

            palavras.forEach(palavra => {

                if (
                    texto.includes(
                        normalizarTexto(palavra)
                    )
                ) {

                    pontos[ofensor]++;

                }

            });

        }
    );


    const melhor =
        Object.entries(pontos)
            .sort((a, b) => b[1] - a[1])[0];


    if (!melhor || melhor[1] === 0) {

        return classificacao === "COMPRA"
            ? "LOGISTICA"
            : classificacao;

    }


    return melhor[0];

}


/* =========================================================
   PRIORIDADE
   ========================================================= */

function determinarPrioridade(texto) {

    const critica = [
        "URGENTE",
        "URGÊNCIA",
        "URGENCIA",
        "RISCO",
        "RISCO DE VIDA",
        "EMERGÊNCIA",
        "EMERGENCIA",
        "ÓBITO",
        "OBITO",
        "CIRURGIA IMEDIATA",
        "INTERNAÇÃO",
        "INTERNACAO"
    ];


    const alta = [
        "URGÊNCIA",
        "URGENCIA",
        "CIRURGIA",
        "INTERNAÇÃO",
        "INTERNACAO",
        "ATRASO",
        "PREJUDICADO",
        "IMPACTO"
    ];


    const media = [
        "PENDENTE",
        "AGUARDANDO",
        "SOLICITAÇÃO",
        "SOLICITACAO",
        "PRAZO"
    ];


    if (contemAlgum(texto, critica)) {
        return "CRITICA";
    }

    if (contemAlgum(texto, alta)) {
        return "ALTA";
    }

    if (contemAlgum(texto, media)) {
        return "MEDIA";
    }

    return "BAIXA";

}


/* =========================================================
   CONFIANÇA
   ========================================================= */

function calcularConfianca(texto, classificacao) {

    let pontos = 0;

    const palavrasRelevantes = texto
        .split(/\s+/)
        .filter(Boolean);


    if (palavrasRelevantes.length >= 5) {

        pontos += 20;

    } else if (palavrasRelevantes.length >= 2) {

        pontos += 10;

    }


    const palavrasCategoria = {

        MATERIAL: [
            "MATERIAL",
            "LUVA",
            "SERINGA",
            "GAZE"
        ],

        MEDICAMENTO: [
            "MEDICAMENTO",
            "REMEDIO",
            "FARMACO"
        ],

        LOGISTICA: [
            "ENTREGA",
            "TRANSPORTE",
            "LOGISTICA",
            "ESTOQUE"
        ],

        COMPRA: [
            "COMPRA",
            "AQUISICAO",
            "COTACAO"
        ],

        OPME: [
            "OPME",
            "PROTESE",
            "ORTESE",
            "IMPLANTE"
        ]

    };


    const termos =
        palavrasCategoria[classificacao] || [];


    termos.forEach(termo => {

        if (
            texto.includes(
                normalizarTexto(termo)
            )
        ) {

            pontos += 20;

        }

    });


    return Math.min(
        98,
        Math.max(35, 40 + pontos)
    );

}


/* =========================================================
   FILTROS
   ========================================================= */

function configurarFiltros() {

    const pesquisa = $("searchDemandas");

    const classificacao =
        $("filtroClassificacao");

    const operadora =
        $("filtroOperadora");

    const prioridade =
        $("filtroPrioridade");

    const ofensor =
        $("filtroOfensor");

    const limpar =
        $("limparFiltros");


    if (pesquisa) {

        pesquisa.addEventListener(
            "input",
            aplicarFiltros
        );

    }


    [
        classificacao,
        operadora,
        prioridade,
        ofensor
    ].forEach(elemento => {

        if (elemento) {

            elemento.addEventListener(
                "change",
                aplicarFiltros
            );

        }

    });


    if (limpar) {

        limpar.addEventListener(
            "click",
            limparFiltros
        );

    }

}


function aplicarFiltros() {

    estado.filtros = {

        pesquisa:
            $("searchDemandas")?.value
                ?.trim()
                .toLowerCase() || "",

        classificacao:
            $("filtroClassificacao")?.value || "",

        operadora:
            $("filtroOperadora")?.value || "",

        prioridade:
            $("filtroPrioridade")?.value || "",

        ofensor:
            $("filtroOfensor")?.value || ""

    };


    estado.dadosFiltrados =
        estado.dados.filter(registro => {

            const texto =
                normalizarTexto(
                    [
                        registro.registro,
                        registro.protocolo,
                        registro.beneficiario,
                        registro.reclamacao,
                        registro.prestador,
                        registro.operadora,
                        registro.classificacao,
                        registro.ofensor
                    ].join(" ")
                );


            const pesquisaOK =
                !estado.filtros.pesquisa ||
                texto.includes(
                    normalizarTexto(
                        estado.filtros.pesquisa
                    )
                );


            const classificacaoOK =
                !estado.filtros.classificacao ||
                registro.classificacao ===
                estado.filtros.classificacao;


            const operadoraOK =
                !estado.filtros.operadora ||
                registro.operadora ===
                estado.filtros.operadora;


            const prioridadeOK =
                !estado.filtros.prioridade ||
                registro.prioridade ===
                estado.filtros.prioridade;


            const ofensorOK =
                !estado.filtros.ofensor ||
                registro.ofensor ===
                estado.filtros.ofensor;


            return (
                pesquisaOK &&
                classificacaoOK &&
                operadoraOK &&
                prioridadeOK &&
                ofensorOK
            );

        });


    estado.paginaAtual = 1;

    renderizarTabela();

}


function limparFiltros() {

    if ($("searchDemandas")) {
        $("searchDemandas").value = "";
    }

    [
        "filtroClassificacao",
        "filtroOperadora",
        "filtroPrioridade",
        "filtroOfensor"
    ].forEach(id => {

        if ($(id)) {
            $(id).value = "";
        }

    });


    aplicarFiltros();

}


/* =========================================================
   TABELA
   ========================================================= */

function renderizarTabela() {

    const tbody =
        $("tabelaDemandasBody");

    if (!tbody) return;


    tbody.innerHTML = "";


    if (
        estado.dadosFiltrados.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td colspan="12">

                    <div class="empty-state">

                        <i class="fas fa-file-circle-question"></i>

                        <h4>Nenhuma demanda encontrada</h4>

                        <p>
                            Importe uma planilha ou altere os filtros.
                        </p>

                    </div>

                </td>

            </tr>

        `;

        atualizarContadorTabela();

        renderizarPaginacao();

        return;

    }


    const inicio =
        (estado.paginaAtual - 1) *
        CONFIG.registrosPorPagina;


    const fim =
        inicio +
        CONFIG.registrosPorPagina;


    const registros =
        estado.dadosFiltrados.slice(
            inicio,
            fim
        );


    registros.forEach(registro => {

        const tr =
            document.createElement("tr");


        tr.innerHTML = `

            <td>
                ${escaparHTML(registro.registro)}
            </td>

            <td>
                ${escaparHTML(registro.protocolo)}
            </td>

            <td>
                ${escaparHTML(registro.beneficiario)}
            </td>

            <td>
                ${escaparHTML(registro.data)}
            </td>

            <td title="${escaparHTML(registro.reclamacao)}">
                ${escaparHTML(
                    limitarTexto(
                        registro.reclamacao,
                        55
                    )
                )}
            </td>

            <td>
                ${escaparHTML(registro.prestador)}
            </td>

            <td>
                ${escaparHTML(registro.operadora)}
            </td>

            <td>
                ${badgeClassificacao(
                    registro.classificacao
                )}
            </td>

            <td>
                ${badgeOfensor(
                    registro.ofensor
                )}
            </td>

            <td>
                ${badgePrioridade(
                    registro.prioridade
                )}
            </td>

            <td>
                ${badgeConfianca(
                    registro.confianca
                )}
            </td>

            <td>

                <button
                    class="table-action"
                    title="Ver detalhes"
                    onclick="abrirDetalhes(${registro.id})"
                >

                    <i class="fas fa-eye"></i>

                </button>

            </td>

        `;


        tbody.appendChild(tr);

    });


    atualizarContadorTabela();

    renderizarPaginacao();

}


function atualizarContadorTabela() {

    const contador =
        $("contadorTabela");

    if (!contador) return;

    contador.textContent =
        `${estado.dadosFiltrados.length} registro(s)`;

}


function renderizarPaginacao() {

    const container =
        $("pagination");

    if (!container) return;

    container.innerHTML = "";


    const totalPaginas =
        Math.ceil(
            estado.dadosFiltrados.length /
            CONFIG.registrosPorPagina
        );


    if (totalPaginas <= 1) return;


    for (
        let pagina = 1;
        pagina <= totalPaginas;
        pagina++
    ) {

        const button =
            document.createElement("button");

        button.textContent = pagina;

        if (
            pagina ===
            estado.paginaAtual
        ) {

            button.classList.add("active");

        }


        button.addEventListener(
            "click",
            () => {

                estado.paginaAtual = pagina;

                renderizarTabela();

            }
        );


        container.appendChild(button);

    }

}


/* =========================================================
   BADGES
   ========================================================= */

function badgeClassificacao(valor) {

    const classes = {

        MATERIAL: "blue",
        MEDICAMENTO: "purple",
        LOGISTICA: "orange",
        COMPRA: "yellow",
        OPME: "green"

    };

    return `
        <span class="badge ${classes[valor] || "blue"}">
            ${formatarTexto(valor)}
        </span>
    `;

}


function badgeOfensor(valor) {

    const classes = {

        FARMACIA: "purple",
        LOGISTICA: "orange",
        OPME: "green",
        MEDICAMENTO: "blue",
        MATERIAL: "yellow"

    };

    return `
        <span class="badge ${classes[valor] || "blue"}">
            ${formatarTexto(valor)}
        </span>
    `;

}


function badgePrioridade(valor) {

    const classes = {

        CRITICA: "red",
        ALTA: "orange",
        MEDIA: "yellow",
        BAIXA: "green"

    };

    return `
        <span class="badge ${classes[valor] || "blue"}">
            ${formatarTexto(valor)}
        </span>
    `;

}


function badgeConfianca(valor) {

    let classe = "red";

    if (valor >= 80) {
        classe = "green";
    } else if (valor >= 60) {
        classe = "yellow";
    }

    return `
        <span class="badge ${classe}">
            ${valor}%
        </span>
    `;

}


/* =========================================================
   MODAL
   ========================================================= */

function configurarModal() {

    const modal =
        $("modalDetalhes");

    const fechar =
        $("fecharModal");

    const fecharFooter =
        $("fecharModalFooter");


    if (fechar) {

        fechar.addEventListener(
            "click",
            fecharModal
        );

    }


    if (fecharFooter) {

        fecharFooter.addEventListener(
            "click",
            fecharModal
        );

    }


    if (modal) {

        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target === modal
                ) {

                    fecharModal();

                }

            }
        );

    }


    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {

                fecharModal();

            }

        }
    );

}


function abrirDetalhes(id) {

    const registro =
        estado.dados.find(
            item => item.id === id
        );

    if (!registro) return;


    if ($("modalProtocolo")) {

        $("modalProtocolo").textContent =
            `Protocolo: ${registro.protocolo}`;

    }


    const conteudo =
        $("modalConteudo");

    if (!conteudo) return;


    conteudo.innerHTML = `

        <div class="summary-item">
            <span>Nº Registro</span>
            <strong>${escaparHTML(registro.registro)}</strong>
        </div>

        <div class="summary-item">
            <span>Protocolo</span>
            <strong>${escaparHTML(registro.protocolo)}</strong>
        </div>

        <div class="summary-item">
            <span>Beneficiário</span>
            <strong>${escaparHTML(registro.beneficiario)}</strong>
        </div>

        <div class="summary-item">
            <span>Data</span>
            <strong>${escaparHTML(registro.data)}</strong>
        </div>

        <div class="summary-item">
            <span>Prestador</span>
            <strong>${escaparHTML(registro.prestador)}</strong>
        </div>

        <div class="summary-item">
            <span>Operadora</span>
            <strong>${escaparHTML(registro.operadora)}</strong>
        </div>

        <div class="summary-item">
            <span>Classificação</span>
            <strong>
                ${badgeClassificacao(
                    registro.classificacao
                )}
            </strong>
        </div>

        <div class="summary-item">
            <span>Ofensor</span>
            <strong>
                ${badgeOfensor(
                    registro.ofensor
                )}
            </strong>
        </div>

        <div class="summary-item">
            <span>Prioridade</span>
            <strong>
                ${badgePrioridade(
                    registro.prioridade
                )}
            </strong>
        </div>

        <div class="summary-item">
            <span>Confiança</span>
            <strong>
                ${registro.confianca}%
            </strong>
        </div>

        <div style="
            margin-top:20px;
            padding:15px;
            border-radius:10px;
            background:var(--bg-tertiary);
        ">

            <strong style="font-size:11px;">
                Reclamação
            </strong>

            <p style="
                margin-top:8px;
                color:var(--text-secondary);
                font-size:11px;
                line-height:1.6;
            ">
                ${escaparHTML(
                    registro.reclamacao
                )}
            </p>

        </div>

    `;


    const modal =
        $("modalDetalhes");

    if (modal) {

        modal.classList.remove("hidden");

    }

}


function fecharModal() {

    const modal =
        $("modalDetalhes");

    if (modal) {

        modal.classList.add("hidden");

    }

}


/* =========================================================
   MOTOR DE ANÁLISE
   ========================================================= */

function configurarMotorAnalise() {

    const button =
        $("executarAnalise");

    if (button) {

        button.addEventListener(
            "click",
            executarAnalise
        );

    }

}


function executarAnalise() {

    if (estado.dados.length === 0) {

        mostrarToast(
            "Importe uma planilha antes de executar a análise.",
            "warning"
        );

        return;

    }


    estado.dados =
        estado.dados.map(registro => {

            const classificacao =
                classificarDemanda(
                    registro.textoAnalise
                );


            const ofensor =
                identificarOfensor(
                    registro.textoAnalise,
                    classificacao
                );


            const prioridade =
                determinarPrioridade(
                    registro.textoAnalise
                );


            const confianca =
                calcularConfianca(
                    registro.textoAnalise,
                    classificacao
                );


            return {

                ...registro,

                classificacao,
                ofensor,
                prioridade,
                confianca

            };

        });


    estado.dadosFiltrados =
        [...estado.dados];


    estado.ultimaAnalise =
        new Date();


    atualizarInterface();

    mostrarToast(
        "Análise concluída com sucesso.",
        "success"
    );

}


/* =========================================================
   ATUALIZAÇÃO DA INTERFACE
   ========================================================= */

function atualizarInterface() {

    atualizarEstatisticas();

    atualizarOperadoras();

    aplicarFiltros();

    atualizarIndicadores();

    atualizarRanking();

    atualizarAlertas();

    atualizarResumo();

    atualizarGraficos();

}


/* =========================================================
   ESTATÍSTICAS
   ========================================================= */

function atualizarEstatisticas() {

    const total =
        estado.dados.length;


    const criticas =
        estado.dados.filter(
            d => d.prioridade === "CRITICA"
        ).length;


    const resolvidas =
        estado.dados.filter(
            d => d.status === "RESOLVIDA"
        ).length;


    const taxa =
        total > 0
            ? Math.round(
                (resolvidas / total) * 100
            )
            : 0;


    definirTexto(
        "totalDemandas",
        total
    );

    definirTexto(
        "totalCriticas",
        criticas
    );

    definirTexto(
        "totalResolvidas",
        resolvidas
    );

    definirTexto(
        "taxaResolucao",
        `${taxa}%`
    );

    definirTexto(
        "menuTotalDemandas",
        total
    );

    definirTexto(
        "menuAlertas",
        criticas
    );

    definirTexto(
        "notificationCount",
        criticas
    );

}


/* =========================================================
   OPERADORAS
   ========================================================= */

function atualizarOperadoras() {

    const select =
        $("filtroOperadora");

    if (!select) return;


    const atual =
        select.value;


    const operadoras =
        [...new Set(
            estado.dados
                .map(d => d.operadora)
                .filter(Boolean)
        )]
        .sort();


    select.innerHTML = `
        <option value="">Todas</option>
    `;


    operadoras.forEach(operadora => {

        const option =
            document.createElement("option");

        option.value = operadora;

        option.textContent = operadora;

        select.appendChild(option);

    });


    if (
        operadoras.includes(atual)
    ) {

        select.value = atual;

    }

}


/* =========================================================
   INDICADORES
   ========================================================= */

function atualizarIndicadores() {

    const total =
        estado.dados.length;


    const contagem = {};

    estado.dados.forEach(d => {

        contagem[d.classificacao] =
            (contagem[d.classificacao] || 0) + 1;

    });


    const dominante =
        Object.entries(contagem)
            .sort((a, b) => b[1] - a[1])[0];


    const criticas =
        estado.dados.filter(
            d => d.prioridade === "CRITICA"
        ).length;


    const resolvidas =
        estado.dados.filter(
            d => d.status === "RESOLVIDA"
        ).length;


    const taxa =
        total > 0
            ? Math.round(
                (resolvidas / total) * 100
            )
            : 0;


    definirTexto(
        "indicadorTotal",
        total
    );

    definirTexto(
        "indicadorDominante",
        dominante
            ? formatarTexto(dominante[0])
            : "-"
    );

    definirTexto(
        "indicadorTaxa",
        `${taxa}%`
    );

    definirTexto(
        "indicadorCriticas",
        criticas
    );


    const confianca =
        total > 0
            ? Math.round(
                estado.dados.reduce(
                    (sum, d) =>
                        sum + d.confianca,
                    0
                ) / total
            )
            : 0;


    definirTexto(
        "confiancaMedia",
        `${confianca}%`
    );


    if ($("ultimaAnalise")) {

        $("ultimaAnalise").textContent =
            estado.ultimaAnalise
                ? formatarDataHora(
                    estado.ultimaAnalise
                )
                : "Nenhuma análise executada";

    }

}


/* =========================================================
   RANKING
   ========================================================= */

function atualizarRanking() {

    const contagem = {};

    CONFIG.ofensores.forEach(ofensor => {

        contagem[ofensor] = 0;

    });


    estado.dados.forEach(registro => {

        if (
            contagem[registro.ofensor] !== undefined
        ) {

            contagem[registro.ofensor]++;

        }

    });


    const ranking =
        Object.entries(contagem)
            .sort((a, b) => b[1] - a[1]);


    renderizarRankingPrincipal(ranking);

    renderizarTopOfensores(ranking);

}


function renderizarRankingPrincipal(ranking) {

    const container =
        $("rankingOfensores");

    if (!container) return;


    container.innerHTML = "";


    ranking.forEach(
        ([ofensor, quantidade], index) => {

            container.innerHTML += `

                <div class="ranking-card">

                    <div class="ranking-card-header">

                        <div class="ranking-position">
                            #${index + 1}
                        </div>

                        <i class="fas fa-user-shield"></i>

                    </div>

                    <h3>
                        ${formatarTexto(ofensor)}
                    </h3>

                    <div class="ranking-number">
                        ${quantidade}
                    </div>

                    <span style="
                        color:var(--text-secondary);
                        font-size:10px;
                    ">
                        demanda(s)
                    </span>

                </div>

            `;

        }
    );


}


function renderizarTopOfensores(ranking) {

    const container =
        $("topOfensores");

    if (!container) return;


    if (estado.dados.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <i class="fas fa-ranking-star"></i>

                <p>
                    Nenhum dado disponível.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML = "";


    ranking
        .slice(0, 5)
        .forEach(
            ([ofensor, quantidade], index) => {

                container.innerHTML += `

                    <div class="ranking-item">

                        <div class="ranking-position">
                            ${index + 1}
                        </div>

                        <div class="ranking-info">

                            <strong>
                                ${formatarTexto(ofensor)}
                            </strong>

                            <span>
                                Ofensor identificado
                            </span>

                        </div>

                        <div class="ranking-value">
                            ${quantidade}
                        </div>

                    </div>

                `;

            }
        );

}


/* =========================================================
   ALERTAS
   ========================================================= */

function atualizarAlertas() {

    const container =
        $("listaAlertas");

    if (!container) return;


    const criticas =
        estado.dados.filter(
            d => d.prioridade === "CRITICA"
        );


    const altas =
        estado.dados.filter(
            d => d.prioridade === "ALTA"
        );


    if (
        criticas.length === 0 &&
        altas.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <i class="fas fa-shield-halved"></i>

                <h4>Nenhum alerta</h4>

                <p>
                    Não existem demandas críticas ou altas.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML = "";


    criticas.slice(0, 10)
        .forEach(registro => {

            container.innerHTML += criarAlerta(
                registro,
                "danger",
                "fa-circle-exclamation"
            );

        });


    altas.slice(0, 10)
        .forEach(registro => {

            container.innerHTML += criarAlerta(
                registro,
                "warning",
                "fa-triangle-exclamation"
            );

        });

}


function criarAlerta(
    registro,
    tipo,
    icone
) {

    return `

        <div class="alert-item ${tipo}">

            <div class="alert-icon">

                <i class="fas ${icone}"></i>

            </div>

            <div class="alert-content">

                <strong>
                    Demanda ${escaparHTML(
                        registro.protocolo
                    )}
                </strong>

                <span>
                    Prioridade ${formatarTexto(
                        registro.prioridade
                    )}
                    ·
                    Ofensor ${formatarTexto(
                        registro.ofensor
                    )}
                </span>

            </div>

            <button
                class="table-action"
                onclick="abrirDetalhes(${registro.id})"
            >

                <i class="fas fa-eye"></i>

            </button>

        </div>

    `;

}


/* =========================================================
   RESUMO EXECUTIVO
   ========================================================= */

function atualizarResumo() {

    const container =
        $("resumoExecutivo");

    if (!container) return;


    if (estado.dados.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <i class="fas fa-chart-simple"></i>

                <h4>Nenhuma análise disponível</h4>

                <p>
                    Importe uma planilha para gerar
                    o resumo executivo.
                </p>

            </div>

        `;

        return;

    }


    const classificacoes = {};

    estado.dados.forEach(d => {

        classificacoes[d.classificacao] =
            (classificacoes[d.classificacao] || 0) + 1;

    });


    const dominante =
        Object.entries(classificacoes)
            .sort((a,b) => b[1] - a[1])[0];


    const criticas =
        estado.dados.filter(
            d => d.prioridade === "CRITICA"
        ).length;


    const confianca =
        Math.round(
            estado.dados.reduce(
                (sum, d) =>
                    sum + d.confianca,
                0
            ) / estado.dados.length
        );


    container.innerHTML = `

        <div class="summary-item">

            <span>Total de demandas</span>

            <strong>
                ${estado.dados.length}
            </strong>

        </div>


        <div class="summary-item">

            <span>Classificação predominante</span>

            <strong>
                ${formatarTexto(
                    dominante?.[0] || "-"
                )}
            </strong>

        </div>


        <div class="summary-item">

            <span>Demandas críticas</span>

            <strong class="text-danger">
                ${criticas}
            </strong>

        </div>


        <div class="summary-item">

            <span>Confiança média</span>

            <strong>
                ${confianca}%
            </strong>

        </div>

    `;

}


/* =========================================================
   GRÁFICOS
   ========================================================= */

function atualizarGraficos() {

    if (
        typeof Chart === "undefined"
    ) {

        return;

    }


    criarGraficoClassificacao();

    criarGraficoPrioridade();

    criarGraficoOperadora();

    criarGraficoEvolucao();

}


function destruirGrafico(nome) {

    if (estado.graficos[nome]) {

        estado.graficos[nome].destroy();

        estado.graficos[nome] = null;

    }

}


function criarGraficoClassificacao() {

    const canvas =
        $("graficoClassificacao");

    if (!canvas) return;


    destruirGrafico("classificacao");


    const contagem = {

        MATERIAL: 0,
        MEDICAMENTO: 0,
        LOGISTICA: 0,
        COMPRA: 0,
        OPME: 0

    };


    estado.dados.forEach(d => {

        if (contagem[d.classificacao] !== undefined) {

            contagem[d.classificacao]++;

        }

    });


    estado.graficos.classificacao =
        new Chart(
            canvas,
            {
                type: "doughnut",

                data: {

                    labels: [
                        "Material",
                        "Medicamento",
                        "Logística",
                        "Compra",
                        "OPME"
                    ],

                    datasets: [{

                        data: [
                            contagem.MATERIAL,
                            contagem.MEDICAMENTO,
                            contagem.LOGISTICA,
                            contagem.COMPRA,
                            contagem.OPME
                        ],

                        borderWidth: 0

                    }]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            position: "bottom"
                        }

                    }

                }

            }
        );

}


function criarGraficoPrioridade() {

    const canvas =
        $("graficoPrioridade");

    if (!canvas) return;


    destruirGrafico("prioridade");


    const contagem = {

        CRITICA: 0,
        ALTA: 0,
        MEDIA: 0,
        BAIXA: 0

    };


    estado.dados.forEach(d => {

        if (contagem[d.prioridade] !== undefined) {

            contagem[d.prioridade]++;

        }

    });


    estado.graficos.prioridade =
        new Chart(
            canvas,
            {

                type: "bar",

                data: {

                    labels: [
                        "Crítica",
                        "Alta",
                        "Média",
                        "Baixa"
                    ],

                    datasets: [{

                        label: "Demandas",

                        data: [
                            contagem.CRITICA,
                            contagem.ALTA,
                            contagem.MEDIA,
                            contagem.BAIXA
                        ]

                    }]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {
                        legend: {
                            display: false
                        }
                    },

                    scales: {

                        y: {
                            beginAtZero: true
                        }

                    }

                }

            }
        );

}


function criarGraficoOperadora() {

    const canvas =
        $("graficoOperadora");

    if (!canvas) return;


    destruirGrafico("operadora");


    const contagem = {};


    estado.dados.forEach(d => {

        const operadora =
            d.operadora || "Não informado";

        contagem[operadora] =
            (contagem[operadora] || 0) + 1;

    });


    const ranking =
        Object.entries(contagem)
            .sort((a,b) => b[1] - a[1])
            .slice(0, 10);


    estado.graficos.operadora =
        new Chart(
            canvas,
            {

                type: "bar",

                data: {

                    labels:
                        ranking.map(
                            item => item[0]
                        ),

                    datasets: [{

                        label: "Demandas",

                        data:
                            ranking.map(
                                item => item[1]
                            )

                    }]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    indexAxis: "y",

                    plugins: {

                        legend: {
                            display: false
                        }

                    },

                    scales: {

                        x: {
                            beginAtZero: true
                        }

                    }

                }

            }
        );

}


function criarGraficoEvolucao() {

    const canvas =
        $("graficoEvolucao");

    if (!canvas) return;


    destruirGrafico("evolucao");


    const contagem = {};


    estado.dados.forEach(d => {

        const data =
            normalizarData(d.data);

        if (!data) return;

        contagem[data] =
            (contagem[data] || 0) + 1;

    });


    const ordenado =
        Object.entries(contagem)
            .sort((a,b) =>
                a[0].localeCompare(b[0])
            )
            .slice(-12);


    estado.graficos.evolucao =
        new Chart(
            canvas,
            {

                type: "line",

                data: {

                    labels:
                        ordenado.map(
                            item => item[0]
                        ),

                    datasets: [{

                        label: "Demandas",

                        data:
                            ordenado.map(
                                item => item[1]
                            ),

                        tension: 0.3,

                        fill: false

                    }]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    scales: {

                        y: {
                            beginAtZero: true
                        }

                    }

                }

            }
        );

}


/* =========================================================
   EXPORTAÇÃO
   ========================================================= */

function configurarExportacao() {

    const excel =
        $("exportarExcel");

    const csv =
        $("exportarCSV");

    const relatorio =
        $("exportarRelatorio");


    if (excel) {

        excel.addEventListener(
            "click",
            exportarExcel
        );

    }


    if (csv) {

        csv.addEventListener(
            "click",
            exportarCSV
        );

    }


    if (relatorio) {

        relatorio.addEventListener(
            "click",
            exportarRelatorio
        );

    }

}


function exportarExcel() {

    if (estado.dados.length === 0) {

        mostrarToast(
            "Não existem dados para exportar.",
            "warning"
        );

        return;

    }


    const dados =
        estado.dados.map(d => ({

            "Nº REGISTRO":
                d.registro,

            "PROTOCOLO":
                d.protocolo,

            "BENEFICIÁRIO":
                d.beneficiario,

            "DATA":
                d.data,

            "RECLAMAÇÃO":
                d.reclamacao,

            "PRESTADOR":
                d.prestador,

            "OPERADORA":
                d.operadora,

            "CLASSIFICAÇÃO":
                d.classificacao,

            "OFENSOR":
                d.ofensor,

            "PRIORIDADE":
                d.prioridade,

            "CONFIANÇA":
                `${d.confianca}%`,

            "STATUS":
                d.status

        }));


    const worksheet =
        XLSX.utils.json_to_sheet(dados);


    const workbook =
        XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Resultado"
    );


    XLSX.writeFile(
        workbook,
        "resultado_SIGDH_5.0.xlsx"
    );


    mostrarToast(
        "Excel exportado com sucesso.",
        "success"
    );

}


function exportarCSV() {

    if (estado.dados.length === 0) {

        mostrarToast(
            "Não existem dados para exportar.",
            "warning"
        );

        return;

    }


    const dados =
        estado.dados.map(d => ({

            REGISTRO: d.registro,
            PROTOCOLO: d.protocolo,
            BENEFICIARIO: d.beneficiario,
            DATA: d.data,
            RECLAMACAO: d.reclamacao,
            PRESTADOR: d.prestador,
            OPERADORA: d.operadora,
            CLASSIFICACAO: d.classificacao,
            OFENSOR: d.ofensor,
            PRIORIDADE: d.prioridade,
            CONFIANCA: `${d.confianca}%`,
            STATUS: d.status

        }));


    const worksheet =
        XLSX.utils.json_to_sheet(dados);


    const csv =
        XLSX.utils.sheet_to_csv(
            worksheet,
            {
                FS: ";"
            }
        );


    const blob =
        new Blob(
            ["\ufeff" + csv],
            {
                type: "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download =
        "resultado_SIGDH_5.0.csv";


    link.click();

    URL.revokeObjectURL(url);


    mostrarToast(
        "CSV exportado com sucesso.",
        "success"
    );

}


function exportarRelatorio() {

    if (estado.dados.length === 0) {

        mostrarToast(
            "Não existem dados para gerar o relatório.",
            "warning"
        );

        return;

    }


    const total =
        estado.dados.length;


    const criticas =
        estado.dados.filter(
            d => d.prioridade === "CRITICA"
        ).length;


    const classificacoes = {};

    estado.dados.forEach(d => {

        classificacoes[d.classificacao] =
            (classificacoes[d.classificacao] || 0) + 1;

    });


    const dominante =
        Object.entries(classificacoes)
            .sort((a,b) => b[1] - a[1])[0];


    const confianca =
        Math.round(
            estado.dados.reduce(
                (sum,d) =>
                    sum + d.confianca,
                0
            ) / total
        );


    const texto = `

SIGDH 5.0
RELATÓRIO EXECUTIVO

Data: ${formatarDataHora(new Date())}

========================================

RESUMO

Total de demandas: ${total}

Demandas críticas: ${criticas}

Classificação predominante:
${formatarTexto(dominante?.[0] || "-")}

Confiança média:
${confianca}%

========================================

OFENSORES

${CONFIG.ofensores.map(ofensor => {

    const quantidade =
        estado.dados.filter(
            d => d.ofensor === ofensor
        ).length;

    return `${formatarTexto(ofensor)}: ${quantidade}`;

}).join("\n")}

========================================

Gerado pelo SIGDH 5.0

`;


    const blob =
        new Blob(
            [texto],
            {
                type: "text/plain;charset=utf-8"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download =
        "relatorio_executivo_SIGDH_5.0.txt";


    link.click();

    URL.revokeObjectURL(url);


    mostrarToast(
        "Relatório gerado com sucesso.",
        "success"
    );

}


/* =========================================================
   HISTÓRICO
   ========================================================= */

function salvarHistoricoImportacao(
    nome,
    quantidade
) {

    const historico =
        JSON.parse(
            localStorage.getItem(
                "sigdH_historico"
            ) || "[]"
        );


    historico.unshift({

        nome,

        quantidade,

        data:
            new Date().toISOString()

    });


    localStorage.setItem(
        "sigdH_historico",
        JSON.stringify(
            historico.slice(0, 20)
        )
    );


    renderizarHistorico();

}


function renderizarHistorico() {

    const container =
        $("historicoImportacoes");

    if (!container) return;


    const historico =
        JSON.parse(
            localStorage.getItem(
                "sigdH_historico"
            ) || "[]"
        );


    if (historico.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <i class="fas fa-clock-rotate-left"></i>

                <p>
                    Nenhuma importação realizada.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML = "";


    historico.forEach(item => {

        container.innerHTML += `

            <div class="history-item">

                <div class="history-icon">

                    <i class="fas fa-file-excel"></i>

                </div>

                <div class="history-info">

                    <strong>
                        ${escaparHTML(item.nome)}
                    </strong>

                    <span>
                        ${item.quantidade} registro(s)
                        ·
                        ${formatarDataHora(
                            new Date(item.data)
                        )}
                    </span>

                </div>

            </div>

        `;

    });

}


/* =========================================================
   PROGRESSO
   ========================================================= */

function mostrarProgresso(
    porcentagem,
    nome
) {

    const progress =
        $("importProgress");

    const bar =
        $("progressBar");

    const percent =
        $("progressPercent");

    const arquivo =
        $("arquivoNome");


    if (progress) {

        progress.classList.remove(
            "hidden"
        );

    }

    if (bar) {

        bar.style.width =
            `${porcentagem}%`;

    }

    if (percent) {

        percent.textContent =
            `${porcentagem}%`;

    }

    if (arquivo) {

        arquivo.textContent =
            nome;

    }

}


function ocultarProgresso() {

    const progress =
        $("importProgress");

    if (progress) {

        progress.classList.add(
            "hidden"
        );

    }

}


function mostrarResultadoImportacao(
    nome,
    quantidade
) {

    const result =
        $("importResult");

    if (!result) return;


    result.classList.remove(
        "hidden"
    );


    result.innerHTML = `

        <strong>
            <i class="fas fa-circle-check"></i>
            Importação concluída
        </strong>

        <p style="margin-top:6px;">
            Arquivo:
            <strong>
                ${escaparHTML(nome)}
            </strong>
            ·
            ${quantidade} registro(s)
            processado(s).
        </p>

    `;

}


/* =========================================================
   TOAST
   ========================================================= */

function mostrarToast(
    mensagem,
    tipo = "info"
) {

    const container =
        $("toastContainer");

    if (!container) return;


    const toast =
        document.createElement("div");


    const icones = {

        success:
            "fa-circle-check",

        error:
            "fa-circle-xmark",

        warning:
            "fa-triangle-exclamation",

        info:
            "fa-circle-info"

    };


    toast.className =
        `toast ${tipo}`;


    toast.innerHTML = `

        <i class="fas ${icones[tipo] || icones.info}"></i>

        <span>
            ${escaparHTML(mensagem)}
        </span>

    `;


    container.appendChild(toast);


    setTimeout(() => {

        toast.style.opacity = "0";

        toast.style.transform =
            "translateX(20px)";


        setTimeout(() => {

            toast.remove();

        }, 250);

    }, 3500);

}


/* =========================================================
   FUNÇÕES AUXILIARES
   ========================================================= */

function normalizarTexto(valor) {

    return String(valor ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .trim();

}


function contemAlgum(texto, lista) {

    return lista.some(
        termo =>
            texto.includes(
                normalizarTexto(termo)
            )
    );

}


function formatarTexto(valor) {

    return String(valor || "")
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(
            /\b\w/g,
            letra => letra.toUpperCase()
        );

}


function limitarTexto(texto, limite) {

    const valor =
        String(texto || "");

    if (valor.length <= limite) {
        return valor;
    }

    return valor.substring(
        0,
        limite
    ) + "...";

}


function escaparHTML(valor) {

    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function definirTexto(id, valor) {

    const elemento = $(id);

    if (elemento) {

        elemento.textContent = valor;

    }

}


function aguardar(ms) {

    return new Promise(resolve =>
        setTimeout(resolve, ms)
    );

}


function formatarDataHora(data) {

    if (!(data instanceof Date)) {

        data = new Date(data);

    }


    if (isNaN(data.getTime())) {

        return "-";

    }


    return data.toLocaleString(
        "pt-BR",
        {
            dateStyle: "short",
            timeStyle: "short"
        }
    );

}


function normalizarData(valor) {

    if (!valor) return "";

    const texto =
        String(valor).trim();


    let data;


    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(texto)) {

        const partes =
            texto.split("/");

        data = new Date(
            Number(partes[2]),
            Number(partes[1]) - 1,
            Number(partes[0])
        );

    } else {

        data = new Date(texto);

    }


    if (isNaN(data.getTime())) {

        return "";

    }


    return data.toISOString()
        .slice(0, 10);

}


/* =========================================================
   FINAL
   ========================================================= */

renderizarHistorico();
```
