/* =========================================================
   SIGDH 4.0
   SCRIPT.JS
   Sistema Integrado de Gestão e Análise de Demandas
========================================================= */

"use strict";

/* =========================================================
   CONFIGURAÇÃO
========================================================= */

const CONFIG = {
    colunasAnalisadas: [
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
        "LOGISTICA",
        "FARMACIA",
        "OPME",
        "MEDICAMENTO",
        "MATERIAL",
        "COMPRA"
    ],

    prioridades: [
        "ALTA",
        "MEDIA",
        "BAIXA"
    ]
};


/* =========================================================
   ESTADO GLOBAL
========================================================= */

const estado = {

    dados: [],

    dadosFiltrados: [],

    arquivoAtual: null,

    charts: {},

    usuario: {
        nome: "Jamily Dias",
        perfil: "Administradora",
        iniciais: "JD"
    },

    tema: localStorage.getItem("sigdH_tema") || "light",

    historico:
        JSON.parse(
            localStorage.getItem("sigdH_historico") || "[]"
        )
};


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    aplicarTema();

    iniciarRelogio();

    iniciarMenu();

    iniciarImportacao();

    iniciarFiltros();

    iniciarBotoes();

    iniciarModais();

    carregarHistorico();

    atualizarInterface();

    setTimeout(() => {

        const loading =
            document.getElementById("loadingScreen");

        if (loading) {

            loading.classList.add("hidden");

            setTimeout(() => {
                loading.style.display = "none";
            }, 500);

        }

    }, 900);

});


/* =========================================================
   TEMA
========================================================= */

function aplicarTema() {

    const tema =
        localStorage.getItem("sigdH_tema") || "light";

    estado.tema = tema;

    document.documentElement.setAttribute(
        "data-theme",
        tema
    );

    document.body.classList.toggle(
        "dark-mode",
        tema === "dark"
    );

    atualizarIconeTema();
}


function alternarTema() {

    estado.tema =
        estado.tema === "dark"
            ? "light"
            : "dark";

    localStorage.setItem(
        "sigdH_tema",
        estado.tema
    );

    document.documentElement.setAttribute(
        "data-theme",
        estado.tema
    );

    document.body.classList.toggle(
        "dark-mode",
        estado.tema === "dark"
    );

    atualizarIconeTema();

    atualizarGraficos();

    mostrarToast(
        estado.tema === "dark"
            ? "Modo escuro ativado."
            : "Modo claro ativado.",
        "success"
    );
}


function atualizarIconeTema() {

    const botao =
        document.getElementById("themeToggle");

    if (!botao) return;

    const icone =
        botao.querySelector("i");

    if (!icone) return;

    if (estado.tema === "dark") {

        icone.className =
            "fa-solid fa-sun";

        botao.title =
            "Ativar modo claro";

    } else {

        icone.className =
            "fa-solid fa-moon";

        botao.title =
            "Ativar modo escuro";

    }
}


/* =========================================================
   RELÓGIO
========================================================= */

function iniciarRelogio() {

    function atualizar() {

        const elemento =
            document.querySelector("[data-clock]");

        if (!elemento) return;

        const agora = new Date();

        elemento.textContent =
            agora.toLocaleTimeString(
                "pt-BR",
                {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                }
            );
    }

    atualizar();

    setInterval(
        atualizar,
        1000
    );
}


/* =========================================================
   MENU
========================================================= */

function iniciarMenu() {

    const itens =
        document.querySelectorAll(
            ".menu-item"
        );

    itens.forEach(item => {

        item.addEventListener(
            "click",
            () => {

                const section =
                    item.dataset.section;

                if (!section) return;

                mudarSecao(section);

            }
        );

    });


    const botoesImportacao =
        document.querySelectorAll(
            '[data-action="nova-importacao"]'
        );

    botoesImportacao.forEach(botao => {

        botao.addEventListener(
            "click",
            () => {

                mudarSecao("importacao");

            }
        );

    });


    const abrirSidebar =
        document.getElementById(
            "openSidebar"
        );

    if (abrirSidebar) {

        abrirSidebar.addEventListener(
            "click",
            () => {

                const sidebar =
                    document.getElementById(
                        "sidebar"
                    );

                if (sidebar) {

                    sidebar.classList.toggle(
                        "mobile-open"
                    );

                }

            }
        );

    }
}


function mudarSecao(nome) {

    const secoes =
        document.querySelectorAll(
            ".page-section"
        );

    secoes.forEach(secao => {

        secao.classList.remove(
            "active"
        );

    });


    const destino =
        document.getElementById(nome);

    if (destino) {

        destino.classList.add(
            "active"
        );

    }


    const menus =
        document.querySelectorAll(
            ".menu-item"
        );

    menus.forEach(menu => {

        menu.classList.toggle(
            "active",
            menu.dataset.section === nome
        );

    });


    atualizarCabecalho(nome);


    const sidebar =
        document.getElementById("sidebar");

    if (sidebar) {

        sidebar.classList.remove(
            "mobile-open"
        );

    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   CABEÇALHO
========================================================= */

function atualizarCabecalho(secao) {

    const titulos = {

        dashboard: [
            "Dashboard",
            "Visão geral das demandas hospitalares"
        ],

        demandas: [
            "Demandas",
            "Consulta e análise dos registros"
        ],

        importacao: [
            "Importar Planilha",
            "Importação e processamento dos dados"
        ],

        indicadores: [
            "Indicadores",
            "Métricas gerais do processamento"
        ],

        ranking: [
            "Ranking",
            "Ranking dos principais ofensores"
        ],

        ofensores: [
            "Ofensores",
            "Análise dos ofensores"
        ],

        alertas: [
            "Alertas",
            "Demandas que exigem atenção"
        ],

        exportacao: [
            "Exportação",
            "Exportação dos resultados"
        ],

        historico: [
            "Histórico",
            "Importações realizadas"
        ],

        usuarios: [
            "Usuários",
            "Controle de acesso"
        ],

        configuracoes: [
            "Configurações",
            "Configurações do sistema"
        ]

    };


    const dados =
        titulos[secao] ||
        titulos.dashboard;


    const titulo =
        document.getElementById(
            "pageTitle"
        );

    const subtitulo =
        document.getElementById(
            "pageSubtitle"
        );


    if (titulo) {

        titulo.textContent =
            dados[0];

    }


    if (subtitulo) {

        subtitulo.textContent =
            dados[1];

    }
}


/* =========================================================
   IMPORTAÇÃO
========================================================= */

function iniciarImportacao() {

    const input =
        document.getElementById(
            "arquivoExcel"
        );

    const dropZone =
        document.getElementById(
            "dropZone"
        );

    const inputHidden =
        document.getElementById(
            "inputExcelHidden"
        );


    if (input) {

        input.addEventListener(
            "change",
            evento => {

                const arquivo =
                    evento.target.files[0];

                if (arquivo) {

                    processarArquivo(
                        arquivo
                    );

                }

            }
        );

    }


    if (inputHidden) {

        inputHidden.addEventListener(
            "change",
            evento => {

                const arquivo =
                    evento.target.files[0];

                if (arquivo) {

                    processarArquivo(
                        arquivo
                    );

                }

            }
        );

    }


    if (dropZone) {

        dropZone.addEventListener(
            "dragover",
            evento => {

                evento.preventDefault();

                dropZone.classList.add(
                    "dragover"
                );

            }
        );


        dropZone.addEventListener(
            "dragleave",
            () => {

                dropZone.classList.remove(
                    "dragover"
                );

            }
        );


        dropZone.addEventListener(
            "drop",
            evento => {

                evento.preventDefault();

                dropZone.classList.remove(
                    "dragover"
                );


                const arquivo =
                    evento.dataTransfer.files[0];

                if (!arquivo) return;


                const extensao =
                    obterExtensao(
                        arquivo.name
                    );


                if (
                    ![
                        "xlsx",
                        "xls",
                        "csv"
                    ].includes(extensao)
                ) {

                    mostrarToast(
                        "Formato de arquivo não suportado.",
                        "error"
                    );

                    return;

                }


                processarArquivo(
                    arquivo
                );

            }
        );

    }
}


function obterExtensao(nome) {

    return nome
        .split(".")
        .pop()
        .toLowerCase();

}


/* =========================================================
   PROCESSAR ARQUIVO
========================================================= */

async function processarArquivo(arquivo) {

    if (!window.XLSX) {

        mostrarToast(
            "Biblioteca XLSX não foi carregada.",
            "error"
        );

        return;

    }


    estado.arquivoAtual =
        arquivo;


    mostrarProgresso(
        10,
        "Lendo arquivo..."
    );


    try {

        const buffer =
            await arquivo.arrayBuffer();


        mostrarProgresso(
            30,
            "Abrindo planilha..."
        );


        const workbook =
            XLSX.read(
                buffer,
                {
                    type: "array",
                    cellDates: true,
                    raw: false
                }
            );


        if (
            !workbook.SheetNames ||
            workbook.SheetNames.length === 0
        ) {

            throw new Error(
                "A planilha não possui abas."
            );

        }


        const nomeAba =
            workbook.SheetNames[0];


        const sheet =
            workbook.Sheets[
                nomeAba
            ];


        mostrarProgresso(
            50,
            "Lendo registros..."
        );


        const matriz =
            XLSX.utils.sheet_to_json(
                sheet,
                {
                    header: 1,
                    defval: "",
                    raw: false
                }
            );


        if (
            !matriz ||
            matriz.length < 1
        ) {

            throw new Error(
                "A planilha está vazia."
            );

        }


        mostrarProgresso(
            65,
            "Analisando dados..."
        );


        const dados =
            converterPlanilha(
                matriz
            );


        if (!dados.length) {

            throw new Error(
                "Nenhum registro válido foi encontrado."
            );

        }


        estado.dados =
            dados;

        estado.dadosFiltrados =
            [...dados];


        mostrarProgresso(
            85,
            "Atualizando dashboard..."
        );


        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    300
                )
        );


        atualizarInterface();

        registrarHistorico(
            arquivo,
            dados.length
        );


        mostrarProgresso(
            100,
            "Importação concluída!"
        );


        mostrarToast(
            `${dados.length} demandas importadas com sucesso.`,
            "success"
        );


        setTimeout(() => {

            esconderProgresso();

            mudarSecao(
                "dashboard"
            );

        }, 700);


    } catch (erro) {

        console.error(
            "Erro na importação:",
            erro
        );


        esconderProgresso();


        mostrarToast(
            erro.message ||
            "Não foi possível importar a planilha.",
            "error"
        );

    }

}


/* =========================================================
   CONVERTER PLANILHA
========================================================= */

function converterPlanilha(matriz) {

    if (!matriz.length) return [];


    const linhas =
        detectarCabecalho(
            matriz
        );


    const inicio =
        linhas.inicio;


    const cabecalho =
        linhas.cabecalho;


    const resultado = [];


    for (
        let i = inicio;
        i < matriz.length;
        i++
    ) {

        const linha =
            matriz[i];


        if (
            !linha ||
            linha.every(
                valor =>
                    String(valor ?? "").trim() === ""
            )
        ) {

            continue;

        }


        const registro =
            criarRegistro(
                linha,
                i + 1,
                cabecalho
            );


        if (registro) {

            resultado.push(
                registro
            );

        }

    }


    return resultado;
}


/* =========================================================
   DETECTAR CABEÇALHO
========================================================= */

function detectarCabecalho(matriz) {

    const primeira =
        matriz[0] || [];


    const possuiTexto =
        primeira.some(
            valor =>
                typeof valor === "string" &&
                valor.trim() !== ""
        );


    if (possuiTexto) {

        return {
            inicio: 1,
            cabecalho: primeira
        };

    }


    return {
        inicio: 0,
        cabecalho: []
    };
}


/* =========================================================
   CRIAR REGISTRO
========================================================= */

function criarRegistro(
    linha,
    numero,
    cabecalho
) {

    const get =
        letra => {

            const indice =
                colunaParaIndice(
                    letra
                );

            return normalizarTexto(
                linha[indice]
            );

        };


    const dadosColunas = {

        A: get("A"),
        G: get("G"),
        I: get("I"),
        L: get("L"),
        P: get("P"),
        Q: get("Q"),
        AD: get("AD"),
        AE: get("AE"),
        AM: get("AM"),
        AV: get("AV"),
        BB: get("BB")

    };


    const textoAnalise =
        Object.values(
            dadosColunas
        )
        .join(" ")
        .trim();


    if (!textoAnalise) {

        return null;

    }


    const classificacao =
        classificarDemanda(
            textoAnalise
        );


    const ofensor =
        identificarOfensor(
            textoAnalise,
            classificacao
        );


    const prioridade =
        calcularPrioridade(
            textoAnalise
        );


    const confianca =
        calcularConfianca(
            textoAnalise,
            classificacao,
            ofensor
        );


    return {

        numero,

        protocolo:
            dadosColunas.A ||
            obterValorAlternativo(
                linha,
                [
                    0,
                    1,
                    6
                ]
            ),

        beneficiario:
            dadosColunas.G ||
            obterValorAlternativo(
                linha,
                [
                    6,
                    7,
                    8
                ]
            ),

        data:
            dadosColunas.I ||
            obterValorAlternativo(
                linha,
                [
                    8,
                    9
                ]
            ),

        reclamacao:
            [
                dadosColunas.L,
                dadosColunas.P,
                dadosColunas.Q,
                dadosColunas.AD,
                dadosColunas.AE,
                dadosColunas.AM,
                dadosColunas.AV,
                dadosColunas.BB
            ]
            .filter(Boolean)
            .join(" | "),

        classificacao,

        ofensor,

        prioridade,

        confianca,

        nivelConfianca:
            obterNivelConfianca(
                confianca
            ),

        colunas:
            dadosColunas,

        dadosOriginais:
            linha,

        cabecalho

    };
}


/* =========================================================
   COLUNA EXCEL → ÍNDICE
========================================================= */

function colunaParaIndice(coluna) {

    let resultado = 0;

    const texto =
        coluna.toUpperCase();


    for (
        let i = 0;
        i < texto.length;
        i++
    ) {

        resultado =
            resultado * 26 +
            texto.charCodeAt(i) -
            64;

    }


    return resultado - 1;
}


/* =========================================================
   NORMALIZAÇÃO
========================================================= */

function normalizarTexto(valor) {

    if (
        valor === null ||
        valor === undefined
    ) {

        return "";

    }


    if (
        valor instanceof Date
    ) {

        return valor.toLocaleDateString(
            "pt-BR"
        );

    }


    return String(valor)
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .trim();

}


/* =========================================================
   TEXTO PARA ANÁLISE
========================================================= */

function textoNormalizado(texto) {

    return String(texto || "")
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toUpperCase();

}


/* =========================================================
   CLASSIFICAÇÃO
========================================================= */

function classificarDemanda(texto) {

    const t =
        textoNormalizado(
            texto
        );


    const regras = {

        OPME: [
            "OPME",
            "PROTESE",
            "PROTESES",
            "ORTese",
            "ORTESE",
            "ORTESIS",
            "IMPLANTE",
            "STENT",
            "CATETER",
            "PLACA",
            "PARAFUSO",
            "PROTESE",
            "MATERIAL ESPECIAL"
        ],

        MEDICAMENTO: [
            "MEDICAMENTO",
            "MEDICAMENTOS",
            "REMEDIO",
            "REMEDIOS",
            "FARMACO",
            "FARMACIA",
            "COMPRIMIDO",
            "CAPSULA",
            "AMPOLA",
            "INJECAO",
            "DOSE",
            "PRESCRICAO",
            "QUIMIOTERAPIA"
        ],

        LOGISTICA: [
            "ENTREGA",
            "ENTREGAR",
            "TRANSPORTE",
            "ATRASO",
            "ATRASADO",
            "LOGISTICA",
            "LOGISTICO",
            "MOTORISTA",
            "COLETA",
            "MOVIMENTACAO",
            "PRAZO",
            "DISTRIBUICAO"
        ],

        COMPRA: [
            "COMPRA",
            "COMPRAR",
            "AQUISICAO",
            "PEDIDO DE COMPRA",
            "COTACAO",
            "FORNECEDOR",
            "ORCAMENTO",
            "PROCESSO DE COMPRA"
        ],

        MATERIAL: [
            "MATERIAL",
            "INSUMO",
            "INSUMOS",
            "LUVAS",
            "LUVA",
            "SERINGA",
            "GAZE",
            "ALGODAO",
            "CURATIVO",
            "MASCARA",
            "EQUIPAMENTO",
            "DISPOSITIVO"
        ]

    };


    const pontuacao = {

        MATERIAL: 0,
        MEDICAMENTO: 0,
        LOGISTICA: 0,
        COMPRA: 0,
        OPME: 0

    };


    Object.keys(regras).forEach(
        categoria => {

            regras[categoria].forEach(
                palavra => {

                    const p =
                        textoNormalizado(
                            palavra
                        );

                    if (
                        t.includes(p)
                    ) {

                        pontuacao[
                            categoria
                        ]++;

                    }

                }
            );

        }
    );


    let melhor =
        "MATERIAL";


    let maior =
        0;


    Object.entries(
        pontuacao
    ).forEach(
        ([categoria, pontos]) => {

            if (
                pontos > maior
            ) {

                maior =
                    pontos;

                melhor =
                    categoria;

            }

        }
    );


    return melhor;
}


/* =========================================================
   OFENSOR
========================================================= */

function identificarOfensor(
    texto,
    classificacao
) {

    const t =
        textoNormalizado(
            texto
        );


    if (
        [
            "FARMACIA",
            "FARMACEUTICO",
            "FARMACEUTICA",
            "DISPENSACAO",
            "ESTOQUE FARMACEUTICO"
        ].some(
            palavra =>
                t.includes(
                    palavra
                )
        )
    ) {

        return "FARMACIA";

    }


    if (
        classificacao === "OPME"
    ) {

        return "OPME";

    }


    if (
        classificacao === "MEDICAMENTO"
    ) {

        return "MEDICAMENTO";

    }


    if (
        classificacao === "LOGISTICA"
    ) {

        return "LOGISTICA";

    }


    if (
        classificacao === "COMPRA"
    ) {

        return "COMPRA";

    }


    return "MATERIAL";
}


/* =========================================================
   PRIORIDADE
========================================================= */

function calcularPrioridade(texto) {

    const t =
        textoNormalizado(
            texto
        );


    const alta = [
        "URGENTE",
        "URGENCIA",
        "RISCO",
        "RISCO DE VIDA",
        "GRAVE",
        "GRAVIDADE",
        "EMERGENCIA",
        "EMERGENCIAL",
        "UTI",
        "CENTRO CIRURGICO",
        "CIRURGIA",
        "IMEDIATO",
        "IMEDIATA",
        "NAO PODE ESPERAR",
        "ATRASO CRITICO"
    ];


    const media = [
        "ATRASO",
        "ATRASADO",
        "PENDENTE",
        "PENDENCIA",
        "AGUARDANDO",
        "PRAZO",
        "DEMORA",
        "RECLAMACAO",
        "PROBLEMA"
    ];


    if (
        alta.some(
            palavra =>
                t.includes(
                    palavra
                )
        )
    ) {

        return "ALTA";

    }


    if (
        media.some(
            palavra =>
                t.includes(
                    palavra
                )
        )
    ) {

        return "MEDIA";

    }


    return "BAIXA";
}


/* =========================================================
   CONFIANÇA
========================================================= */

function calcularConfianca(
    texto,
    classificacao,
    ofensor
) {

    const t =
        textoNormalizado(
            texto
        );


    let pontos = 35;


    if (
        t.length > 50
    ) {

        pontos += 10;

    }


    if (
        t.length > 120
    ) {

        pontos += 10;

    }


    const palavrasPorCategoria = {

        MATERIAL: [
            "MATERIAL",
            "INSUMO",
            "LUVA",
            "SERINGA"
        ],

        MEDICAMENTO: [
            "MEDICAMENTO",
            "REMEDIO",
            "FARMACO"
        ],

        LOGISTICA: [
            "ENTREGA",
            "TRANSPORTE",
            "ATRASO",
            "LOGISTICA"
        ],

        COMPRA: [
            "COMPRA",
            "AQUISICAO",
            "FORNECEDOR"
        ],

        OPME: [
            "OPME",
            "PROTESE",
            "IMPLANTE",
            "CATETER"
        ]

    };


    const palavras =
        palavrasPorCategoria[
            classificacao
        ] || [];


    const encontrados =
        palavras.filter(
            palavra =>
                t.includes(
                    palavra
                )
        );


    pontos +=
        encontrados.length * 10;


    if (
        ofensor === classificacao ||
        (
            classificacao === "MEDICAMENTO" &&
            ofensor === "FARMACIA"
        )
    ) {

        pontos += 10;

    }


    return Math.min(
        99,
        Math.max(
            1,
            pontos
        )
    );
}


/* =========================================================
   NÍVEL DE CONFIANÇA
========================================================= */

function obterNivelConfianca(valor) {

    if (valor >= 80) {

        return "ALTA";

    }


    if (valor >= 50) {

        return "MEDIA";

    }


    return "BAIXA";
}


/* =========================================================
   ATUALIZAR INTERFACE
========================================================= */

function atualizarInterface() {

    atualizarCards();

    aplicarFiltros();

    atualizarIndicadores();

    atualizarOfensores();

    atualizarRanking();

    atualizarResumo();

    atualizarAlertas();

    atualizarGraficos();

    renderizarHistorico();

}


/* =========================================================
   CARDS
========================================================= */

function atualizarCards() {

    const total =
        estado.dados.length;


    const processadas =
        estado.dados.filter(
            item =>
                item.classificacao
        ).length;


    const criticas =
        estado.dados.filter(
            item =>
                item.prioridade === "ALTA"
        ).length;


    const confianca =
        total
            ? Math.round(
                estado.dados.reduce(
                    (
                        soma,
                        item
                    ) =>
                        soma +
                        Number(
                            item.confianca ||
                            0
                        ),
                    0
                ) / total
            )
            : 0;


    definirTexto(
        "totalDemandas",
        total
    );


    definirTexto(
        "processadas",
        processadas
    );


    definirTexto(
        "demandasCriticas",
        criticas
    );


    definirTexto(
        "confiancaMedia",
        `${confianca}%`
    );


    const ofensor =
        obterDominante(
            estado.dados,
            "ofensor"
        );


    const classificacao =
        obterDominante(
            estado.dados,
            "classificacao"
        );


    definirTexto(
        "ofensorDominante",
        formatarCategoria(
            ofensor
        )
    );


    definirTexto(
        "classificacaoDominante",
        formatarCategoria(
            classificacao
        )
    );


    definirTexto(
        "altaConfianca",
        estado.dados.filter(
            item =>
                item.nivelConfianca === "ALTA"
        ).length
    );


    definirTexto(
        "baixaConfianca",
        estado.dados.filter(
            item =>
                item.nivelConfianca === "BAIXA"
        ).length
    );
}


/* =========================================================
   FILTROS
========================================================= */

function iniciarFiltros() {

    const ids = [
        "searchDemandas",
        "filtroClassificacao",
        "filtroOfensor",
        "filtroPrioridade",
        "filtroConfianca"
    ];


    ids.forEach(id => {

        const elemento =
            document.getElementById(id);

        if (!elemento) return;


        elemento.addEventListener(
            "input",
            aplicarFiltros
        );


        elemento.addEventListener(
            "change",
            aplicarFiltros
        );

    });

}


/* =========================================================
   APLICAR FILTROS
========================================================= */

function aplicarFiltros() {

    const busca =
        obterValor(
            "searchDemandas"
        )
        .toLowerCase();


    const classificacao =
        obterValor(
            "filtroClassificacao"
        );


    const ofensor =
        obterValor(
            "filtroOfensor"
        );


    const prioridade =
        obterValor(
            "filtroPrioridade"
        );


    const confianca =
        obterValor(
            "filtroConfianca"
        );


    estado.dadosFiltrados =
        estado.dados.filter(
            item => {

                const texto =
                    [
                        item.protocolo,
                        item.beneficiario,
                        item.reclamacao,
                        item.classificacao,
                        item.ofensor
                    ]
                    .join(" ")
                    .toLowerCase();


                if (
                    busca &&
                    !texto.includes(
                        busca
                    )
                ) {

                    return false;

                }


                if (
                    classificacao &&
                    item.classificacao !==
                    classificacao
                ) {

                    return false;

                }


                if (
                    ofensor &&
                    item.ofensor !==
                    ofensor
                ) {

                    return false;

                }


                if (
                    prioridade &&
                    item.prioridade !==
                    prioridade
                ) {

                    return false;

                }


                if (
                    confianca &&
                    item.nivelConfianca !==
                    confianca
                ) {

                    return false;

                }


                return true;

            }
        );


    renderizarTabela();

    atualizarContadorTabela();
}


/* =========================================================
   RENDERIZAR TABELA
========================================================= */

function renderizarTabela() {

    const tbody =
        document.getElementById(
            "TabelaDemandasBody"
        );


    if (!tbody) return;


    if (
        !estado.dadosFiltrados.length
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="10"
                    class="empty-table"
                >

                    <i class="fa-solid fa-file-excel"></i>

                    <strong>
                        Nenhuma demanda encontrada
                    </strong>

                    <span>
                        Importe uma planilha ou altere os filtros.
                    </span>

                </td>

            </tr>

        `;

        return;

    }


    tbody.innerHTML =
        estado.dadosFiltrados
        .map(
            (item, index) =>
                gerarLinhaTabela(
                    item,
                    index
                )
        )
        .join("");


    tbody
        .querySelectorAll(
            "[data-detalhes]"
        )
        .forEach(botao => {

            botao.addEventListener(
                "click",
                () => {

                    const indice =
                        Number(
                            botao.dataset.detalhes
                        );

                    abrirDetalhes(
                        estado.dadosFiltrados[
                            indice
                        ]
                    );

                }
            );

        });
}


/* =========================================================
   LINHA DA TABELA
========================================================= */

function gerarLinhaTabela(
    item,
    index
) {

    return `

        <tr>

            <td>
                ${index + 1}
            </td>

            <td>
                <strong>
                    ${escaparHTML(
                        item.protocolo || "—"
                    )}
                </strong>
            </td>

            <td>
                ${escaparHTML(
                    item.beneficiario || "—"
                )}
            </td>

            <td>
                ${escaparHTML(
                    item.data || "—"
                )}
            </td>

            <td class="reclamacao-cell">
                ${escaparHTML(
                    item.reclamacao || "—"
                )}
            </td>

            <td>
                <span class="badge badge-classificacao">
                    ${formatarCategoria(
                        item.classificacao
                    )}
                </span>
            </td>

            <td>
                <span class="badge badge-ofensor">
                    ${formatarCategoria(
                        item.ofensor
                    )}
                </span>
            </td>

            <td>
                <span class="badge prioridade-${String(
                    item.prioridade
                ).toLowerCase()}">
                    ${formatarCategoria(
                        item.prioridade
                    )}
                </span>
            </td>

            <td>
                <span class="confidence ${String(
                    item.nivelConfianca
                ).toLowerCase()}">
                    ${item.confianca}%
                </span>
            </td>

            <td>

                <button
                    class="table-action"
                    data-detalhes="${index}"
                    title="Ver detalhes"
                    type="button"
                >

                    <i class="fa-solid fa-eye"></i>

                </button>

            </td>

        </tr>

    `;
}


/* =========================================================
   CONTADOR
========================================================= */

function atualizarContadorTabela() {

    const elemento =
        document.getElementById(
            "contadorTabela"
        );


    if (!elemento) return;


    const quantidade =
        estado.dadosFiltrados.length;


    elemento.textContent =
        `${quantidade} ${
            quantidade === 1
                ? "registro"
                : "registros"
        }`;
}


/* =========================================================
   INDICADORES
========================================================= */

function atualizarIndicadores() {

    const total =
        estado.dados.length;


    const dominante =
        obterDominante(
            estado.dados,
            "classificacao"
        );


    const criticas =
        estado.dados.filter(
            item =>
                item.prioridade === "ALTA"
        ).length;


    definirTexto(
        "indicadorTotal",
        total
    );


    definirTexto(
        "indicadorDominante",
        formatarCategoria(
            dominante
        )
    );


    definirTexto(
        "indicadorTaxa",
        total
            ? "100%"
            : "0%"
    );


    definirTexto(
        "indicadorCriticas",
        criticas
    );


    definirTexto(
        "indicadorConfiancaAlta",
        estado.dados.filter(
            item =>
                item.nivelConfianca === "ALTA"
        ).length
    );


    definirTexto(
        "indicadorConfiancaMedia",
        estado.dados.filter(
            item =>
                item.nivelConfianca === "MEDIA"
        ).length
    );


    definirTexto(
        "indicadorConfiancaBaixa",
        estado.dados.filter(
            item =>
                item.nivelConfianca === "BAIXA"
        ).length
    );


    const processamento =
        document.getElementById(
            "indicadorProcessamento"
        );


    if (processamento) {

        processamento.innerHTML =
            total
                ? `
                    <strong>
                        Processamento concluído
                    </strong>

                    <span>
                        ${total} registros foram analisados.
                    </span>
                `
                : `
                    Nenhum processamento realizado.
                `;

    }
}


/* =========================================================
   OFENSORES
========================================================= */

function atualizarOfensores() {

    const contagens = {

        LOGISTICA: 0,
        FARMACIA: 0,
        OPME: 0,
        MEDICAMENTO: 0,
        MATERIAL: 0,
        COMPRA: 0

    };


    estado.dados.forEach(
        item => {

            if (
                contagens[
                    item.ofensor
                ] !== undefined
            ) {

                contagens[
                    item.ofensor
                ]++;

            }

        }
    );


    definirTexto(
        "ofensorLogistica",
        contagens.LOGISTICA
    );


    definirTexto(
        "ofensorFarmacia",
        contagens.FARMACIA
    );


    definirTexto(
        "ofensorOpme",
        contagens.OPME
    );


    definirTexto(
        "ofensorMedicamento",
        contagens.MEDICAMENTO
    );


    definirTexto(
        "ofensorMaterial",
        contagens.MATERIAL
    );


    definirTexto(
        "ofensorCompra",
        contagens.COMPRA
    );


    const analise =
        document.getElementById(
            "analiseOfensores"
        );


    if (!analise) return;


    if (!estado.dados.length) {

        analise.innerHTML = `
            <div class="empty-state">
                Nenhuma análise disponível.
            </div>
        `;

        return;

    }


    const ranking =
        Object.entries(
            contagens
        )
        .sort(
            (a, b) =>
                b[1] - a[1]
        );


    const maior =
        ranking[0];


    analise.innerHTML = `

        <div class="executive-item">

            <strong>
                Principal ofensor
            </strong>

            <span>
                ${formatarCategoria(
                    maior[0]
                )}
                — ${maior[1]} demandas
            </span>

        </div>

    `;
}


/* =========================================================
   RANKING
========================================================= */

function atualizarRanking() {

    const lista =
        document.getElementById(
            "rankingLista"
        );


    if (!lista) return;


    if (!estado.dados.length) {

        lista.innerHTML = `
            <div class="empty-state">
                Nenhuma análise disponível.
            </div>
        `;

        return;

    }


    const contagem = {};


    estado.dados.forEach(
        item => {

            contagem[
                item.ofensor
            ] =
                (
                    contagem[
                        item.ofensor
                    ] || 0
                ) + 1;

        }
    );


    const ranking =
        Object.entries(
            contagem
        )
        .sort(
            (a, b) =>
                b[1] - a[1]
        );


    const total =
        estado.dados.length;


    lista.innerHTML =
        ranking
        .map(
            ([nome, quantidade], index) => {

                const percentual =
                    Math.round(
                        (
                            quantidade /
                            total
                        ) * 100
                    );


                return `

                    <div class="ranking-item">

                        <div class="ranking-position">
                            ${index + 1}
                        </div>

                        <div class="ranking-info">

                            <strong>
                                ${formatarCategoria(
                                    nome
                                )}
                            </strong>

                            <span>
                                ${quantidade} demandas
                            </span>

                        </div>

                        <div class="ranking-value">

                            <strong>
                                ${percentual}%
                            </strong>

                        </div>

                    </div>

                `;

            }
        )
        .join("");
}


/* =========================================================
   RESUMO EXECUTIVO
========================================================= */

function atualizarResumo() {

    const elemento =
        document.getElementById(
            "resumoExecutivo"
        );


    if (!elemento) return;


    if (!estado.dados.length) {

        elemento.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-chart-column"></i>
                <strong>Nenhuma planilha analisada</strong>
                <span>Importe uma planilha para gerar o resumo.</span>
            </div>
        `;

        return;

    }


    const total =
        estado.dados.length;


    const criticas =
        estado.dados.filter(
            item =>
                item.prioridade === "ALTA"
        ).length;


    const confianca =
        Math.round(
            estado.dados.reduce(
                (soma, item) =>
                    soma +
                    item.confianca,
                0
            ) / total
        );


    const dominante =
        obterDominante(
            estado.dados,
            "ofensor"
        );


    elemento.innerHTML = `

        <div class="executive-summary">

            <div class="executive-item">
                <strong>Total</strong>
                <span>${total} demandas analisadas.</span>
            </div>

            <div class="executive-item">
                <strong>Ofensor dominante</strong>
                <span>${formatarCategoria(
                    dominante
                )}</span>
            </div>

            <div class="executive-item">
                <strong>Demandas críticas</strong>
                <span>${criticas}</span>
            </div>

            <div class="executive-item">
                <strong>Confiança média</strong>
                <span>${confianca}%</span>
            </div>

        </div>

    `;
}


/* =========================================================
   ALERTAS
========================================================= */

function atualizarAlertas() {

    const elemento =
        document.getElementById(
            "alertasSistema"
        );


    const lista =
        document.getElementById(
            "listaAlertas"
        );


    const criticas =
        estado.dados.filter(
            item =>
                item.prioridade === "ALTA"
        );


    const baixaConfianca =
        estado.dados.filter(
            item =>
                item.nivelConfianca === "BAIXA"
        );


    let html = "";


    if (criticas.length) {

        html += `

            <div class="alert-item">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <div>

                    <strong>
                        ${criticas.length} demandas críticas
                    </strong>

                    <span>
                        Demandas classificadas com prioridade alta.
                    </span>

                </div>

            </div>

        `;

    }


    if (baixaConfianca.length) {

        html += `

            <div class="alert-item">

                <i class="fa-solid fa-circle-question"></i>

                <div>

                    <strong>
                        ${baixaConfianca.length} registros com baixa confiança
                    </strong>

                    <span>
                        Recomenda-se revisão manual.
                    </span>

                </div>

            </div>

        `;

    }


    if (!html) {

        html = `
            <div class="empty-state">
                <i class="fa-solid fa-shield-halved"></i>
                <strong>Nenhum alerta</strong>
                <span>O sistema não encontrou situações críticas.</span>
            </div>
        `;

    }


    if (elemento) {

        elemento.innerHTML =
            html;

    }


    if (lista) {

        lista.innerHTML =
            html;

    }
}


/* =========================================================
   GRÁFICOS
========================================================= */

function atualizarGraficos() {

    if (!window.Chart) return;


    criarGraficoClassificacao();

    criarGraficoPrioridade();

    criarGraficoDistribuicao();

    criarGraficoEvolucao();

    criarGraficoOfensores();

}


/* =========================================================
   DESTROY CHART
========================================================= */

function destruirGrafico(nome) {

    if (
        estado.charts[nome]
    ) {

        estado.charts[nome].destroy();

        estado.charts[nome] =
            null;

    }
}


/* =========================================================
   CORES
========================================================= */

function coresGrafico() {

    return [
        "#2563eb",
        "#10b981",
        "#f59e0b",
        "#ef4444",
        "#8b5cf6",
        "#06b6d4"
    ];

}


/* =========================================================
   CLASSIFICAÇÃO
========================================================= */

function criarGraficoClassificacao() {

    const canvas =
        document.getElementById(
            "graficoClassificacao"
        );


    if (!canvas) return;


    destruirGrafico(
        "classificacao"
    );


    const categorias =
        CONFIG.classificacoes;


    const valores =
        categorias.map(
            categoria =>
                estado.dados.filter(
                    item =>
                        item.classificacao ===
                        categoria
                ).length
        );


    estado.charts.classificacao =
        new Chart(
            canvas,
            {
                type: "doughnut",

                data: {

                    labels:
                        categorias.map(
                            formatarCategoria
                        ),

                    datasets: [
                        {
                            data: valores,
                            backgroundColor:
                                coresGrafico(),
                            borderWidth: 0
                        }
                    ]

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


/* =========================================================
   PRIORIDADE
========================================================= */

function criarGraficoPrioridade() {

    const canvas =
        document.getElementById(
            "graficoPrioridade"
        );


    if (!canvas) return;


    destruirGrafico(
        "prioridade"
    );


    const categorias = [
        "ALTA",
        "MEDIA",
        "BAIXA"
    ];


    const valores =
        categorias.map(
            categoria =>
                estado.dados.filter(
                    item =>
                        item.prioridade ===
                        categoria
                ).length
        );


    estado.charts.prioridade =
        new Chart(
            canvas,
            {
                type: "doughnut",

                data: {

                    labels:
                        categorias.map(
                            formatarCategoria
                        ),

                    datasets: [
                        {
                            data: valores,
                            backgroundColor:
                                [
                                    "#ef4444",
                                    "#f59e0b",
                                    "#10b981"
                                ],
                            borderWidth: 0
                        }
                    ]

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


/* =========================================================
   DISTRIBUIÇÃO
========================================================= */

function criarGraficoDistribuicao() {

    const canvas =
        document.getElementById(
            "graficoDistribuicao"
        );


    if (!canvas) return;


    destruirGrafico(
        "distribuicao"
    );


    const categorias =
        CONFIG.classificacoes;


    const valores =
        categorias.map(
            categoria =>
                estado.dados.filter(
                    item =>
                        item.classificacao ===
                        categoria
                ).length
        );


    estado.charts.distribuicao =
        new Chart(
            canvas,
            {
                type: "bar",

                data: {

                    labels:
                        categorias.map(
                            formatarCategoria
                        ),

                    datasets: [
                        {
                            label:
                                "Demandas",
                            data:
                                valores,
                            backgroundColor:
                                coresGrafico()
                        }
                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    scales: {

                        y: {
                            beginAtZero: true,
                            ticks: {
                                precision: 0
                            }
                        }

                    },

                    plugins: {

                        legend: {
                            display: false
                        }

                    }

                }

            }
        );
}


/* =========================================================
   EVOLUÇÃO
========================================================= */

function criarGraficoEvolucao() {

    const canvas =
        document.getElementById(
            "graficoEvolucao"
        );


    if (!canvas) return;


    destruirGrafico(
        "evolucao"
    );


    const dados =
        agruparPorData(
            estado.dados
        );


    estado.charts.evolucao =
        new Chart(
            canvas,
            {
                type: "line",

                data: {

                    labels:
                        dados.labels,

                    datasets: [
                        {
                            label:
                                "Demandas",
                            data:
                                dados.valores,
                            tension:
                                0.3,
                            fill:
                                false
                        }
                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    scales: {

                        y: {
                            beginAtZero: true,
                            ticks: {
                                precision: 0
                            }
                        }

                    }

                }

            }
        );
}


/* =========================================================
   OFENSORES
========================================================= */

function criarGraficoOfensores() {

    const canvas =
        document.getElementById(
            "graficoOfensores"
        );


    if (!canvas) return;


    destruirGrafico(
        "ofensores"
    );


    const contagem = {};


    estado.dados.forEach(
        item => {

            contagem[
                item.ofensor
            ] =
                (
                    contagem[
                        item.ofensor
                    ] || 0
                ) + 1;

        }
    );


    const ranking =
        Object.entries(
            contagem
        )
        .sort(
            (a, b) =>
                b[1] - a[1]
        );


    estado.charts.ofensores =
        new Chart(
            canvas,
            {
                type: "bar",

                data: {

                    labels:
                        ranking.map(
                            item =>
                                formatarCategoria(
                                    item[0]
                                )
                        ),

                    datasets: [
                        {
                            label:
                                "Demandas",
                            data:
                                ranking.map(
                                    item =>
                                        item[1]
                                ),
                            backgroundColor:
                                coresGrafico()
                        }
                    ]

                },

                options: {

                    indexAxis: "y",

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: false
                        }

                    },

                    scales: {

                        x: {
                            beginAtZero: true,
                            ticks: {
                                precision: 0
                            }
                        }

                    }

                }

            }
        );
}


/* =========================================================
   AGRUPAR POR DATA
========================================================= */

function agruparPorData(dados) {

    const mapa = {};


    dados.forEach(
        item => {

            const data =
                item.data ||
                "Sem data";


            mapa[data] =
                (
                    mapa[data] ||
                    0
                ) + 1;

        }
    );


    const labels =
        Object.keys(
            mapa
        );


    return {

        labels,

        valores:
            labels.map(
                data =>
                    mapa[data]
            )

    };
}


/* =========================================================
   DETALHES
========================================================= */

function abrirDetalhes(item) {

    const modal =
        document.getElementById(
            "modalDetalhes"
        );


    if (!modal) return;


    const titulo =
        modal.querySelector(
            "[data-detalhe-titulo]"
        );


    const conteudo =
        modal.querySelector(
            "[data-detalhe-conteudo]"
        );


    if (titulo) {

        titulo.textContent =
            item.protocolo ||
            "Detalhes da demanda";

    }


    if (conteudo) {

        conteudo.innerHTML = `

            <div class="detail-grid">

                <div class="detail-item">
                    <span>Protocolo</span>
                    <strong>
                        ${escaparHTML(
                            item.protocolo || "—"
                        )}
                    </strong>
                </div>

                <div class="detail-item">
                    <span>Beneficiário</span>
                    <strong>
                        ${escaparHTML(
                            item.beneficiario || "—"
                        )}
                    </strong>
                </div>

                <div class="detail-item">
                    <span>Data</span>
                    <strong>
                        ${escaparHTML(
                            item.data || "—"
                        )}
                    </strong>
                </div>

                <div class="detail-item">
                    <span>Classificação</span>
                    <strong>
                        ${formatarCategoria(
                            item.classificacao
                        )}
                    </strong>
                </div>

                <div class="detail-item">
                    <span>Ofensor</span>
                    <strong>
                        ${formatarCategoria(
                            item.ofensor
                        )}
                    </strong>
                </div>

                <div class="detail-item">
                    <span>Prioridade</span>
                    <strong>
                        ${formatarCategoria(
                            item.prioridade
                        )}
                    </strong>
                </div>

                <div class="detail-item">
                    <span>Confiança</span>
                    <strong>
                        ${item.confianca}%
                    </strong>
                </div>

            </div>

            <div class="detail-description">

                <span>
                    Reclamação / dados analisados
                </span>

                <p>
                    ${escaparHTML(
                        item.reclamacao || "—"
                    )}
                </p>

            </div>

        `;

    }


    modal.classList.add(
        "active"
    );

}


/* =========================================================
   MODAIS
========================================================= */

function iniciarModais() {

    document
        .querySelectorAll(
            ".modal-close, .modal-overlay"
        )
        .forEach(
            elemento => {

                elemento.addEventListener(
                    "click",
                    fecharModais
                );

            }
        );


    document.addEventListener(
        "keydown",
        evento => {

            if (
                evento.key === "Escape"
            ) {

                fecharModais();

            }

        }
    );
}


function fecharModais() {

    document
        .querySelectorAll(
            ".modal.active"
        )
        .forEach(
            modal => {

                modal.classList.remove(
                    "active"
                );

            }
        );
}


/* =========================================================
   BOTÕES
========================================================= */

function iniciarBotoes() {

    const tema =
        document.getElementById(
            "themeToggle"
        );


    if (tema) {

        tema.addEventListener(
            "click",
            alternarTema
        );

    }


    const limpar =
        document.querySelector(
            '[data-action="limpar-filtros"]'
        );


    if (limpar) {

        limpar.addEventListener(
            "click",
            limparFiltros
        );

    }


    const exportar =
        document.getElementById(
            "exportarResultados"
        );


    if (exportar) {

        exportar.addEventListener(
            "click",
            () =>
                exportarExcel(
                    estado.dados,
                    "SIGDH_resultados.xlsx"
                )
        );

    }


    const exportarFiltrado =
        document.getElementById(
            "exportarFiltrado"
        );


    if (exportarFiltrado) {

        exportarFiltrado.addEventListener(
            "click",
            () =>
                exportarExcel(
                    estado.dadosFiltrados,
                    "SIGDH_filtrado.xlsx"
                )
        );

    }


    const exportarCriticas =
        document.getElementById(
            "exportarCriticas"
        );


    if (exportarCriticas) {

        exportarCriticas.addEventListener(
            "click",
            () => {

                const dados =
                    estado.dados.filter(
                        item =>
                            item.prioridade ===
                            "ALTA"
                    );


                exportarExcel(
                    dados,
                    "SIGDH_criticas.xlsx"
                );

            }
        );

    }


    const exportarBaixa =
        document.getElementById(
            "exportarBaixaConfianca"
        );


    if (exportarBaixa) {

        exportarBaixa.addEventListener(
            "click",
            () => {

                const dados =
                    estado.dados.filter(
                        item =>
                            item.nivelConfianca ===
                            "BAIXA"
                    );


                exportarExcel(
                    dados,
                    "SIGDH_baixa_confianca.xlsx"
                );

            }
        );

    }


    const limparHistorico =
        document.getElementById(
            "limparHistorico"
        );


    if (limparHistorico) {

        limparHistorico.addEventListener(
            "click",
            () => {

                estado.historico = [];

                localStorage.removeItem(
                    "sigdH_historico"
                );

                renderizarHistorico();

                mostrarToast(
                    "Histórico apagado.",
                    "success"
                );

            }
        );

    }


    /* =====================================================
       BOTÃO DE USUÁRIO
    ===================================================== */

    const perfil =
        document.querySelector(
            ".profile"
        );


    if (perfil) {

        perfil.style.cursor =
            "pointer";


        perfil.addEventListener(
            "click",
            trocarUsuario
        );

    }


    const usuarioMini =
        document.querySelector(
            ".user-mini"
        );


    if (usuarioMini) {

        usuarioMini.style.cursor =
            "pointer";


        usuarioMini.addEventListener(
            "click",
            trocarUsuario
        );

    }

}


/* =========================================================
   TROCA DE USUÁRIO
========================================================= */

function trocarUsuario() {

    const usuarios = [

        {
            nome: "Jamily Dias",
            perfil: "Administradora",
            iniciais: "JD"
        },

        {
            nome: "Bruna Dias",
            perfil: "Analista",
            iniciais: "BD"
        },

        {
            nome: "Gestor SIGDH",
            perfil: "Gestor",
            iniciais: "GS"
        },

        {
            nome: "Operador SAC",
            perfil: "Operador",
            iniciais: "OS"
        }

    ];


    const atual =
        estado.usuario.nome;


    const lista =
        usuarios
        .filter(
            usuario =>
                usuario.nome !==
                atual
        );


    const escolha =
        prompt(
            "Trocar usuário:\n\n" +
            lista
            .map(
                (
                    usuario,
                    index
                ) =>
                    `${index + 1}. ${usuario.nome} — ${usuario.perfil}`
            )
            .join("\n") +
            "\n\nDigite o número:"
        );


    if (!escolha) return;


    const indice =
        Number(escolha) - 1;


    if (
        indice < 0 ||
        indice >= lista.length
    ) {

        mostrarToast(
            "Usuário inválido.",
            "error"
        );

        return;

    }


    estado.usuario =
        lista[indice];


    localStorage.setItem(
        "sigdH_usuario",
        JSON.stringify(
            estado.usuario
        )
    );


    atualizarUsuarioNaTela();


    mostrarToast(
        `Usuário alterado para ${estado.usuario.nome}.`,
        "success"
    );

}


/* =========================================================
   ATUALIZAR USUÁRIO
========================================================= */

function atualizarUsuarioNaTela() {

    const usuario =
        estado.usuario;


    document
        .querySelectorAll(
            ".profile-info strong"
        )
        .forEach(
            elemento => {

                elemento.textContent =
                    usuario.nome;

            }
        );


    document
        .querySelectorAll(
            ".profile-info span"
        )
        .forEach(
            elemento => {

                elemento.textContent =
                    usuario.perfil;

            }
        );


    document
        .querySelectorAll(
            ".profile .avatar"
        )
        .forEach(
            elemento => {

                elemento.textContent =
                    usuario.iniciais;

            }
        );


    document
        .querySelectorAll(
            ".user-mini-info strong"
        )
        .forEach(
            elemento => {

                elemento.textContent =
                    usuario.nome;

            }
        );


    document
        .querySelectorAll(
            ".user-mini-info span"
        )
        .forEach(
            elemento => {

                elemento.textContent =
                    usuario.perfil;

            }
        );


    document
        .querySelectorAll(
            ".user-mini .avatar"
        )
        .forEach(
            elemento => {

                elemento.textContent =
                    usuario.iniciais;

            }
        );
}


/* =========================================================
   LIMPAR FILTROS
========================================================= */

function limparFiltros() {

    [
        "searchDemandas",
        "filtroClassificacao",
        "filtroOfensor",
        "filtroPrioridade",
        "filtroConfianca"
    ]
    .forEach(
        id => {

            const elemento =
                document.getElementById(
                    id
                );


            if (!elemento) return;


            elemento.value =
                "";

        }
    );


    aplicarFiltros();


    mostrarToast(
        "Filtros limpos.",
        "success"
    );
}


/* =========================================================
   EXPORTAÇÃO
========================================================= */

function exportarExcel(
    dados,
    nomeArquivo
) {

    if (!window.XLSX) {

        mostrarToast(
            "Biblioteca XLSX não carregada.",
            "error"
        );

        return;

    }


    if (!dados.length) {

        mostrarToast(
            "Não existem dados para exportar.",
            "warning"
        );

        return;

    }


    const linhas =
        dados.map(
            item => ({

                "Nº":
                    item.numero,

                "PROTOCOLO":
                    item.protocolo,

                "BENEFICIÁRIO":
                    item.beneficiario,

                "DATA":
                    item.data,

                "RECLAMAÇÃO":
                    item.reclamacao,

                "CLASSIFICAÇÃO":
                    item.classificacao,

                "OFENSOR":
                    item.ofensor,

                "PRIORIDADE":
                    item.prioridade,

                "CONFIANÇA":
                    `${item.confianca}%`,

                "NÍVEL CONFIANÇA":
                    item.nivelConfianca

            })
        );


    const worksheet =
        XLSX.utils.json_to_sheet(
            linhas
        );


    const workbook =
        XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Resultados"
    );


    XLSX.writeFile(
        workbook,
        nomeArquivo
    );


    mostrarToast(
        "Arquivo exportado com sucesso.",
        "success"
    );
}


/* =========================================================
   HISTÓRICO
========================================================= */

function registrarHistorico(
    arquivo,
    quantidade
) {

    const registro = {

        id:
            Date.now(),

        nome:
            arquivo.name,

        tamanho:
            arquivo.size,

        quantidade,

        data:
            new Date().toLocaleString(
                "pt-BR"
            )

    };


    estado.historico.unshift(
        registro
    );


    estado.historico =
        estado.historico.slice(
            0,
            20
        );


    localStorage.setItem(
        "sigdH_historico",
        JSON.stringify(
            estado.historico
        )
    );
}


function carregarHistorico() {

    const salvo =
        localStorage.getItem(
            "sigdH_historico"
        );


    if (!salvo) return;


    try {

        estado.historico =
            JSON.parse(
                salvo
            );

    } catch {

        estado.historico = [];

    }


    const usuarioSalvo =
        localStorage.getItem(
            "sigdH_usuario"
        );


    if (usuarioSalvo) {

        try {

            estado.usuario =
                JSON.parse(
                    usuarioSalvo
                );

            atualizarUsuarioNaTela();

        } catch {

            console.warn(
                "Usuário salvo inválido."
            );

        }

    }

}


/* =========================================================
   RENDERIZAR HISTÓRICO
========================================================= */

function renderizarHistorico() {

    const elemento =
        document.getElementById(
            "historicoLista"
        );


    if (!elemento) return;


    if (
        !estado.historico.length
    ) {

        elemento.innerHTML = `

            <div class="empty-state">

                <i class="fa-solid fa-clock-rotate-left"></i>

                <strong>
                    Nenhuma importação registrada
                </strong>

                <span>
                    O histórico será criado após uma importação.
                </span>

            </div>

        `;

        return;

    }


    elemento.innerHTML =
        estado.historico
        .map(
            item => `

                <div class="history-item">

                    <div class="history-icon">

                        <i class="fa-solid fa-file-excel"></i>

                    </div>

                    <div class="history-info">

                        <strong>
                            ${escaparHTML(
                                item.nome
                            )}
                        </strong>

                        <span>
                            ${item.data}
                        </span>

                    </div>

                    <div class="history-count">

                        <strong>
                            ${item.quantidade}
                        </strong>

                        <span>
                            registros
                        </span>

                    </div>

                </div>

            `
        )
        .join("");
}


/* =========================================================
   PROGRESSO
========================================================= */

function mostrarProgresso(
    percentual,
    texto
) {

    const area =
        document.getElementById(
            "importProgress"
        );


    const barra =
        document.getElementById(
            "progressBar"
        );


    const porcentagem =
        document.getElementById(
            "progressPercent"
        );


    const textoElemento =
        document.querySelector(
            "[data-progress-text]"
        );


    if (area) {

        area.classList.remove(
            "hidden"
        );

    }


    if (barra) {

        barra.style.width =
            `${percentual}%`;

    }


    if (porcentagem) {

        porcentagem.textContent =
            `${percentual}%`;

    }


    if (textoElemento) {

        textoElemento.textContent =
            texto;

    }

}


function esconderProgresso() {

    const area =
        document.getElementById(
            "importProgress"
        );


    if (area) {

        area.classList.add(
            "hidden"
        );

    }
}


/* =========================================================
   TOAST
========================================================= */

function mostrarToast(
    mensagem,
    tipo = "info"
) {

    let container =
        document.getElementById(
            "toastContainer"
        );


    if (!container) {

        container =
            document.querySelector(
                ".toast-container"
            );

    }


    if (!container) {

        container =
            document.createElement(
                "div"
            );

        container.id =
            "toastContainer";

        container.className =
            "toast-container";

        document.body.appendChild(
            container
        );

    }


    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        `toast toast-${tipo}`;


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


    toast.innerHTML = `

        <i class="fa-solid ${
            icones[tipo] ||
            icones.info
        }"></i>

        <span>
            ${escaparHTML(
                mensagem
            )}
        </span>

    `;


    container.appendChild(
        toast
    );


    setTimeout(
        () => {

            toast.classList.add(
                "removing"
            );

            setTimeout(
                () => {

                    toast.remove();

                },
                300
            );

        },
        3500
    );
}


/* =========================================================
   UTILITÁRIOS
========================================================= */

function definirTexto(
    id,
    valor
) {

    const elemento =
        document.getElementById(
            id
        );


    if (elemento) {

        elemento.textContent =
            valor;

    }

}


function obterValor(id) {

    const elemento =
        document.getElementById(
            id
        );


    return elemento
        ? elemento.value
        : "";
}


function obterDominante(
    dados,
    propriedade
) {

    if (!dados.length) {

        return "";

    }


    const contagem = {};


    dados.forEach(
        item => {

            const valor =
                item[
                    propriedade
                ];


            if (!valor) return;


            contagem[valor] =
                (
                    contagem[valor] ||
                    0
                ) + 1;

        }
    );


    const ranking =
        Object.entries(
            contagem
        )
        .sort(
            (a, b) =>
                b[1] - a[1]
        );


    return ranking.length
        ? ranking[0][0]
        : "";
}


function formatarCategoria(
    valor
) {

    if (!valor) {

        return "—";

    }


    const mapa = {

        MATERIAL:
            "Material",

        MEDICAMENTO:
            "Medicamento",

        LOGISTICA:
            "Logística",

        COMPRA:
            "Compra",

        OPME:
            "OPME",

        FARMACIA:
            "Farmácia",

        ALTA:
            "Alta",

        MEDIA:
            "Média",

        BAIXA:
            "Baixa"

    };


    return mapa[
        String(valor).toUpperCase()
    ] ||
        valor;

}


function obterValorAlternativo(
    linha,
    indices
) {

    for (
        const indice of indices
    ) {

        const valor =
            normalizarTexto(
                linha[indice]
            );


        if (valor) {

            return valor;

        }

    }


    return "";
}


/* =========================================================
   SEGURANÇA HTML
========================================================= */

function escaparHTML(
    valor
) {

    return String(
        valor ?? ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}


/* =========================================================
   FINALIZAÇÃO
========================================================= */

window.SIGDH = {

    estado,

    importar:
        processarArquivo,

    exportar:
        exportarExcel,

    mudarSecao,

    alternarTema,

    trocarUsuario,

    limparFiltros

};
