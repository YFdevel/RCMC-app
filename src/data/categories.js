export const categories = [
    {
        id: 'sanitary',
        name: 'Сан-эпид. режим',
        icon: 'fa-bookmark',
        subcategories: [
            {
                id: 'indicators',
                name: 'Индикаторы',
                files: [
                    {
                        id: 'indicators_1',
                        name: 'Пар',
                        type: 'image',
                        url: './assets/images/indicators/steam.jpg'
                    },
                    {
                        id: 'indicators_2',
                        name: 'Пероксид водорода',
                        type: 'image',
                        url: './assets/images/indicators/peroxyde.jpg'
                    },
                    {
                        id: 'indicators_3',
                        name: 'Этиленоксид',
                        type: 'image',
                        url: './assets/images/indicators/etylene-oxyde.jpg'
                    },
                    {
                        id: 'indicators_4',
                        name: 'Все индикаторы',
                        type: 'image',
                        url: './assets/images/indicators/all_indicators.jpg'
                    },
                ]
            },
            {
                id: 'presentations',
                name: 'Презентации',
                files: [
                    {
                        id: 'presentations_epidemiolog_09_2025',
                        name: 'Эпидемиолог от 09.2025',
                        type: 'document',
                        url: './assets/files/presentations/epidemiolog092025.pdf'
                    },
                    {
                        id: 'presentations_sterilisation',
                        name: 'Стерилизация',
                        type: 'document',
                        url: './assets/files/presentations/sterilisation.pdf'
                    },

                ]
            },
            {
                id: 'instructions_sanit',
                name: 'Приказы',
                files: [
                    {
                        id: 'instructions_sanit_1',
                        name: '[14-2023] САНПИН (кишечные инфекции)',
                        type: 'document',
                        url: './assets/files/instructions/14_2023.pdf'
                    },
                    {
                        id: 'instructions_sanit_2',
                        name: '[41-2024] САНПИН (парентеральные гепатиты и ВИЧ-инфекция)',
                        type: 'document',
                        url: './assets/files/instructions/41_2024.pdf'
                    },
                    {
                        id: 'instructions_sanit_3',
                        name: '[338-2016] ПРИКАЗ (укус клеща)',
                        type: 'document',
                        url: './assets/files/instructions/338_2016.pdf'
                    },
                    {
                        id: 'instructions_sanit_4',
                        name: '[477-2005] ПРИКАЗ (педикулез)',
                        type: 'document',
                        url: './assets/files/instructions/477_2005.pdf'
                    },
                    {
                        id: 'instructions_sanit_5',
                        name: '[1065-2025] ПРИКАЗ (дезинфекция и стерилизация)',
                        type: 'document',
                        url: './assets/files/instructions/1065_2025.pdf'
                    },
                    {
                        id: 'instructions_sanit_6',
                        name: '[1301-2015] ПРИКАЗ (о мерах по снижению антибактериальной резистентности микроорганизмов)',
                        type: 'document',
                        url: './assets/files/instructions/1301_2015.pdf'
                    },
                    {
                        id: 'instructions_sanit_7',
                        name: '[1341-2018] ПРИКАЗ (профилактика бешенства)',
                        type: 'document',
                        url: './assets/files/instructions/1341_2018.pdf'
                    }

                ]
            },
            {
                id: 'questions_sanit',
                name: 'Вопросы по сан-эпид. режиму',
                files: [
                    {
                        id: 'questions_sanit_2025',
                        name: '2025 г',
                        type: 'document',
                        url: './assets/files/questions/sanit.pdf'
                    }
                ]
            },
            {
                id: 'answers_sanit',
                name: 'Ответы по сан-эпид. режиму (медсестры)',
                files: [
                    {
                        id: 'answers_sanit_1',
                        name: '1',
                        type: 'document',
                        url: './assets/files/answers/sanit_answers_1.pdf'
                    }
                ]
            },
        ]
    },
    {
        id: 'preanalitic',
        name: 'Преаналитика',
        icon: 'fa-bookmark',
        subcategories: [
            {
                id: 'analyzes',
                name: 'Анализы',
                files: [
                    {
                        id: 'analyzes_1',
                        name: 'Анализ слюны на кортизол',
                        type: 'image',
                        url: './assets/images/preanalitic/cortizol-saliva.jpg'
                    },
                    {
                        id: 'analyzes_2',
                        name: 'Взятие анализа мочи (Urina Monovette)',
                        type: 'image',
                        url: './assets/images/preanalitic/urina_monovette.jpg'
                    },
                    {
                        id: 'analyzes_3',
                        name: 'Взятие анализа крови (S-Monovette)',
                        type: 'image',
                        url: './assets/images/preanalitic/blood_take.jpg'
                    }
                ]
            },
            {
                id: 'questions_preanalitic',
                name: 'Вопросы к преаналитике',
                files: [
                    {
                        id: 'questions_preanalitic_2025',
                        name: '2025 г',
                        type: 'document',
                        url: './assets/files/questions/preanalitic.pdf'
                    }
                ]
            },
            {
                id: 'answers_preanalitic',
                name: 'Ответы по преаналитике (медсестры)',
                files: [
                    {
                        id: 'answers_preanalitic_1',
                        name: '1',
                        type: 'document',
                        url: './assets/files/answers/preanalitic_answers_1.pdf'
                    }
                ]
            },
            {
                id: 'instructions_preanalitic',
                name: 'Инструкция по преаналитике РКМЦ',
                files: [
                    {
                        id: 'instructions_preanalitic_1',
                        name: 'Инструкция по преаналитике РКМЦ',
                        type: 'document',
                        url: './assets/files/instructions/preanalitic_instr_rcmc.pdf'
                    }
                ]
            },
        ]
    },
    {
        id: 'radiology',
        name: 'Радиационная безопасность',
        icon: 'fa-bookmark',
        subcategories: [
            {
                id: 'instructions_radiology',
                name: 'Приказы и инструкции',
                files: [
                    {
                        id: 'instructions_radiology_1',
                        name: 'ЗАКОН РБ О радиационной безопасности',
                        type: 'document',
                        url: './assets/files/instructions/base_law_radiology_safety.pdf'
                    }
                ]
            },
            {
                id: 'questions_radiology',
                name: 'Вопросы',
                files: [
                    {
                        id: 'questions_radiology_tickets_2025',
                        name: 'Экзаменационные билеты 2025 г',
                        type: 'document',
                        url: './assets/files/questions/radiology_exam_tickets.pdf'
                    },
                    {
                        id: 'questions_radiology_tests_2025',
                        name: 'Тесты 2025 г',
                        type: 'document',
                        url: './assets/files/questions/radiology_tests.pdf'
                    },
                ]
            },
            {
                id: 'answers_radiology',
                name: 'Ответы по радиационной безопасности',
                files: [
                    {
                        id: 'answers_radiology_2025',
                        name: 'Ответы 2025',
                        type: 'document',
                        url: './assets/files/answers/radiology_safety_answers_2025.pdf'
                    }
                ]
            }

        ]
    },
    {
        id: 'conferencies',
        name: 'Конференции',
        icon: 'fa-bookmark',
        subcategories: [
            {
                id: '',
                name: 'ЭКМО: виды, показания к применению, алгоритм обследования пациентов',
                files: [
                    {
                        id: 'conferencies_indicationsECMO_12_12_2025_1',
                        name: 'ЭКМО: виды, показания к применению, алгоритм обследования пациентов',
                        type: 'document',
                        url: './assets/files/conferencies/indicationsECMO_12_12_2025.pdf'
                    }
                ]
            },

        ]
    },
];

// Или простой вариант без async
export const checkFilePaths = () => {
    categories.forEach(category => {
        category.subcategories.forEach(subcategory => {
            subcategory.files.forEach(file => {
                console.log(`Checking: ${file.name} -> ${file.url}`);
            });
        });
    });
};

export const CORRECT_PASSWORD = 'tgy790BN';