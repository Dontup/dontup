// Dontup: comportamento da página de lançamento. Sem dependências.
(() => {
  const cfg = window.DONTUP || {};
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const brl = (v) => 'R$ ' + Math.round(v).toLocaleString('pt-BR');
  document.documentElement.classList.add('js');

  // Textos configuráveis
  if (cfg.inauguracao) $$('[data-inauguracao]').forEach((el) => { el.textContent = cfg.inauguracao; });
  $$('[data-ano]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  // Botão "Acessar sistema": link real quando houver endereço, senão bloqueado com aviso.
  $$('[data-acesso]').forEach((caixa) => {
    const btn = $('[data-sistema]', caixa);
    if (cfg.sistemaUrl) {
      btn.href = cfg.sistemaUrl;
      btn.removeAttribute('aria-disabled');
      btn.removeAttribute('role');
      btn.removeAttribute('aria-describedby');
      $('.dica', caixa).remove();
      $('svg', btn).remove();
      return;
    }
    let t;
    const avisa = (e) => {
      e.preventDefault();
      caixa.classList.remove('treme');
      void caixa.offsetWidth;
      caixa.classList.add('treme', 'mostra');
      clearTimeout(t);
      t = setTimeout(() => caixa.classList.remove('mostra', 'treme'), 2200);
    };
    btn.addEventListener('click', avisa);
    btn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') avisa(e); });
  });

  // Lista de espera: formulário externo, WhatsApp ou aviso.
  const msgLista = $('[data-lista-msg]');
  $$('[data-lista]').forEach((btn) => {
    if (cfg.listaEsperaUrl) { btn.href = cfg.listaEsperaUrl; btn.target = '_blank'; btn.rel = 'noopener'; return; }
    if (cfg.whatsapp) {
      btn.href = `https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent('Olá! Quero ser avisado da inauguração do Dontup.')}`;
      btn.target = '_blank'; btn.rel = 'noopener';
      return;
    }
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      msgLista.textContent = 'A lista de espera abre junto com o anúncio da data. Volte em breve.';
    });
  });

  // Topo: fundo ao rolar e seção ativa no menu
  const topo = $('#topo');
  const aoRolar = () => {
    topo.classList.toggle('rolou', scrollY > 12);
    const total = document.documentElement.scrollHeight - innerHeight;
    topo.style.setProperty('--leitura', total > 0 ? (scrollY / total).toFixed(4) : 0);
  };
  addEventListener('scroll', aoRolar, { passive: true });
  aoRolar();
  const links = $$('.menu a');
  const secoes = links.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  const obsMenu = new IntersectionObserver((itens) => itens.forEach((it) => {
    if (it.isIntersecting) links.forEach((a) => a.classList.toggle('ativo', a.getAttribute('href') === '#' + it.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  secoes.forEach((s) => obsMenu.observe(s));

  // Menu no celular
  const menuBtn = $('.menu-btn');
  const menuMovel = $('#menu-movel');
  const fechaMenu = () => { menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.setAttribute('aria-label', 'Abrir menu'); menuMovel.hidden = true; };
  menuBtn.addEventListener('click', () => {
    const abrir = menuBtn.getAttribute('aria-expanded') !== 'true';
    menuBtn.setAttribute('aria-expanded', String(abrir));
    menuBtn.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
    menuMovel.hidden = !abrir;
  });
  $$('a', menuMovel).forEach((a) => a.addEventListener('click', fechaMenu));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menuMovel.hidden) { fechaMenu(); menuBtn.focus(); } });

  // Entrada do topo
  const fontes = document.fonts ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 900))]) : Promise.resolve();
  fontes.then(() => requestAnimationFrame(() => document.body.classList.add('carregou')));

  // Funil ao vivo
  const quadro = $('[data-quadro]');
  const cols = $$('.cartoes', quadro);
  const toast = $('[data-toast]');
  const kpi = { aberto: $('[data-kpi="aberto"]'), ganho: $('[data-kpi="ganho"]'), meta: $('[data-kpi="meta"]') };
  const META = 60000;
  let ganhoMes = 18400;
  const pessoas = [
    ['Juliana R.', 'Implante', 4800], ['Carlos M.', 'Clareamento', 1200], ['Beatriz L.', 'Aparelho', 3600],
    ['Rafael T.', 'Canal', 1450], ['Fernanda O.', 'Lentes', 9600], ['Lucas A.', 'Restauração', 380],
    ['Marina C.', 'Clareamento', 1200], ['Pedro H.', 'Prótese', 5200], ['Sofia N.', 'Limpeza', 220],
    ['Gustavo P.', 'Implante', 5100], ['Helena V.', 'Aparelho', 3900], ['Thiago B.', 'Canal', 1600],
  ];
  let proxima = 0;
  const novoCartao = () => {
    const [n, p, v] = pessoas[proxima++ % pessoas.length];
    const c = document.createElement('div');
    c.className = 'cartao';
    c.dataset.v = v;
    c.innerHTML = '<b></b><span></span><em></em>';
    c.children[0].textContent = n;
    c.children[1].textContent = p;
    c.children[2].textContent = brl(v);
    return c;
  };
  [0, 0, 1, 1, 2, 3].forEach((col) => cols[col].append(novoCartao()));

  const animarNumero = (el, de, para) => {
    if (calmo) { el.textContent = brl(para); return; }
    const t0 = performance.now();
    const passo = (t) => {
      const k = Math.min(1, (t - t0) / 900);
      el.textContent = brl(de + (para - de) * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  };
  let abertoAtual = 0;
  let ganhoAtual = 0;
  const atualizaKpis = () => {
    const aberto = cols.slice(0, 3).flatMap((c) => [...c.children]).reduce((s, c) => s + +c.dataset.v, 0);
    animarNumero(kpi.aberto, abertoAtual, aberto); abertoAtual = aberto;
    animarNumero(kpi.ganho, ganhoAtual, ganhoMes); ganhoAtual = ganhoMes;
    kpi.meta.style.width = Math.min(100, (ganhoMes / META) * 100) + '%';
  };
  atualizaKpis();

  let tToast;
  const avisar = (txt) => {
    toast.textContent = txt;
    toast.classList.add('on');
    clearTimeout(tToast);
    tToast = setTimeout(() => toast.classList.remove('on'), 2600);
  };

  // Move com FLIP: mede antes, muda o DOM, anima a diferença.
  const mover = (mudar) => {
    const todos = $$('.cartao', quadro);
    const antes = new Map(todos.map((c) => [c, c.getBoundingClientRect()]));
    mudar();
    $$('.cartao', quadro).forEach((c) => {
      const a = antes.get(c);
      const d = c.getBoundingClientRect();
      if (!a) { c.animate([{ opacity: 0, transform: 'translateY(-10px) scale(.9)' }, { opacity: 1, transform: 'none' }], { duration: 500, easing: 'cubic-bezier(.2,.7,.1,1)' }); return; }
      const dx = a.left - d.left, dy = a.top - d.top;
      if (!dx && !dy) return;
      c.classList.add('movendo');
      c.animate([{ transform: `translate(${dx}px, ${dy}px) rotate(${dx ? -3 : 0}deg)` }, { transform: 'none' }], { duration: 750, easing: 'cubic-bezier(.2,.7,.1,1)' })
        .finished.then(() => c.classList.remove('movendo'));
    });
  };

  // Cursor demonstrativo: vai até o cartão, "pega" e acompanha até a nova coluna.
  const demo = $('.hero-demo');
  const cursor = $('[data-cursor]');
  let cursorPos = { x: 0, y: 0 };
  const espera = (ms) => new Promise((r) => setTimeout(r, ms));
  const pontoDo = (el) => {
    const r = el.getBoundingClientRect();
    const b = demo.getBoundingClientRect();
    return { x: r.left - b.left + r.width * .62, y: r.top - b.top + r.height * .55 };
  };
  const cursorPara = (p, ms) => {
    const a = cursor.animate([{ transform: `translate(${cursorPos.x}px, ${cursorPos.y}px)` }, { transform: `translate(${p.x}px, ${p.y}px)` }],
      { duration: ms, easing: 'cubic-bezier(.2,.7,.1,1)', fill: 'forwards' });
    cursorPos = p;
    return a.finished;
  };
  let primeiro = true;
  const arrastar = async (c, mudar) => {
    if (primeiro) { cursorPos = { x: demo.offsetWidth * .9, y: demo.offsetHeight * .95 }; primeiro = false; }
    cursor.classList.add('on');
    await cursorPara(pontoDo(c), 520);
    cursor.classList.add('clica');
    await espera(140);
    mover(mudar);
    await cursorPara(pontoDo(c), 750);
    cursor.classList.remove('clica');
    await espera(250);
    cursor.classList.remove('on');
  };

  let passo = 0;
  const ciclo = async () => {
    passo++;
    // Prioridade: fechar quem está em avaliação; senão avançar o funil; de vez em quando, chega lead novo.
    if (passo % 4 === 0) {
      mover(() => cols[0].prepend(novoCartao()));
      avisar('Novo pedido pelo link de captação');
    } else if (cols[2].children.length) {
      const c = cols[2].firstElementChild;
      await arrastar(c, () => cols[3].prepend(c));
      c.classList.add('chegou');
      setTimeout(() => c.classList.remove('chegou'), 800);
      ganhoMes += +c.dataset.v;
      avisar(`${c.children[0].textContent} fechou: ${brl(+c.dataset.v)}`);
    } else if (cols[1].children.length) {
      const c = cols[1].firstElementChild;
      await arrastar(c, () => cols[2].append(c));
      avisar('Avaliação marcada pela recepção');
    } else if (cols[0].children.length) {
      const c = cols[0].firstElementChild;
      await arrastar(c, () => cols[1].append(c));
      avisar('Orçamento parado há 2 dias: hora de ligar');
    }
    // Mantém o quadro enxuto
    while (cols[3].children.length > 3) cols[3].lastElementChild.remove();
    while (cols[0].children.length > 3) cols[0].lastElementChild.remove();
    if (ganhoMes > META * 1.05) ganhoMes = 14200;
    atualizaKpis();
  };
  let relogio = null;
  const liga = () => { if (!relogio && !calmo) relogio = setInterval(ciclo, 3200); };
  const desliga = () => { clearInterval(relogio); relogio = null; };
  new IntersectionObserver(([e]) => (e.isIntersecting ? liga() : desliga()), { threshold: .2 }).observe(quadro);
  document.addEventListener('visibilitychange', () => (document.hidden ? desliga() : null));

  // Explorador de recursos (abas acessíveis)
  const abas = $$('[role="tab"]');
  const selecionar = (aba, foco) => {
    abas.forEach((a) => {
      const ativo = a === aba;
      a.setAttribute('aria-selected', String(ativo));
      a.tabIndex = ativo ? 0 : -1;
      const p = document.getElementById(a.getAttribute('aria-controls'));
      p.hidden = !ativo;
      p.classList.remove('entra');
      if (ativo) { void p.offsetWidth; p.classList.add('entra'); }
    });
    if (foco) aba.focus();
    // No celular as abas rolam na horizontal: centraliza a ativa sem mexer na rolagem da página.
    if (listaAbas.scrollWidth > listaAbas.clientWidth) {
      listaAbas.scrollTo({ left: aba.offsetLeft - (listaAbas.clientWidth - aba.offsetWidth) / 2, behavior: calmo ? 'auto' : 'smooth' });
    }
  };
  // Avanço automático enquanto ninguém mexe; a barra de progresso da aba dita o tempo (pausa com o mouse em cima).
  const listaAbas = $('.abas');
  const pararAuto = () => listaAbas.classList.remove('auto');
  abas.forEach((a, i) => {
    $('.prog', a).addEventListener('animationend', () => selecionar(abas[(i + 1) % abas.length]));
    a.addEventListener('click', () => { pararAuto(); selecionar(a); });
    a.addEventListener('keydown', (e) => {
      pararAuto();
      const mapa = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
      if (e.key in mapa) { e.preventDefault(); selecionar(abas[(i + mapa[e.key] + abas.length) % abas.length], true); }
      if (e.key === 'Home') { e.preventDefault(); selecionar(abas[0], true); }
      if (e.key === 'End') { e.preventDefault(); selecionar(abas[abas.length - 1], true); }
    });
  });
  // Primeira aba anima quando o explorador aparece
  const explorador = $('[data-explorador]');
  const obsExp = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    $('.painel-aba:not([hidden])').classList.add('entra');
    if (!calmo) listaAbas.classList.add('auto');
    obsExp.disconnect();
  }, { threshold: .25 });
  obsExp.observe(explorador);

  // Formulário de captação no celular: digita, envia, recomeça.
  const campos = $$('[data-digita]');
  const enviar = $('[data-envia]');
  let rodandoCel = false;
  const digitar = async (el) => {
    el.classList.add('digitando');
    const txt = el.dataset.digita;
    for (let i = 1; i <= txt.length; i++) { el.textContent = txt.slice(0, i); await espera(55 + Math.random() * 50); }
    el.classList.remove('digitando');
    await espera(250);
  };
  const celular = async () => {
    if (rodandoCel) return;
    rodandoCel = true;
    while (rodandoCel) {
      campos.forEach((c) => { c.textContent = ''; });
      enviar.textContent = 'Quero ser contatado';
      enviar.classList.remove('ok');
      await espera(700);
      for (const c of campos) { if (!rodandoCel) return; await digitar(c); }
      enviar.classList.add('aperta'); await espera(160); enviar.classList.remove('aperta');
      enviar.textContent = 'Pedido enviado. A clínica vai te chamar.';
      enviar.classList.add('ok');
      await espera(3200);
    }
  };
  if (calmo) {
    campos.forEach((c) => { c.textContent = c.dataset.digita; });
  } else {
    new IntersectionObserver(([e]) => { if (e.isIntersecting) celular(); else rodandoCel = false; }, { threshold: .4 }).observe($('.celular'));
  }

  // Revelação suave de blocos de leitura e da trilha de passos
  const revelar = [...$$('.cabeca'), $('.op-txt'), $('.op-captacao'), ...$$('.colunas > div'), ...$$('.plano'), $('.seg-grade'), ...$$('.trilha li')].filter(Boolean);
  revelar.forEach((el) => el.setAttribute('data-revela', ''));
  const obs = new IntersectionObserver((itens) => itens.forEach((it) => {
    if (!it.isIntersecting) return;
    const irmaos = [...it.target.parentElement.children].filter((x) => x.hasAttribute('data-revela'));
    it.target.style.transitionDelay = Math.max(0, irmaos.indexOf(it.target)) * 80 + 'ms';
    it.target.classList.add('visivel');
    obs.unobserve(it.target);
  }), { threshold: .15, rootMargin: '0px 0px -40px 0px' });
  revelar.forEach((el) => obs.observe(el));
  const trilha = $('.trilha');
  new IntersectionObserver(([e], o) => { if (e.isIntersecting) { trilha.classList.add('visivel'); o.disconnect(); } }, { threshold: .4 }).observe(trilha);

  // Títulos de seção entram palavra por palavra
  const titulos = $$('.cabeca h2, .op-txt h2, .seg-grade h2, .sim-txt h2, .lanc-titulo');
  titulos.forEach((h) => {
    const palavras = h.textContent.trim().split(/\s+/);
    h.setAttribute('aria-label', h.textContent.trim());
    h.textContent = '';
    palavras.forEach((p, i) => {
      const s = document.createElement('span');
      s.className = 'p';
      s.setAttribute('aria-hidden', 'true');
      s.style.setProperty('--i', i);
      s.textContent = p;
      h.append(s, i < palavras.length - 1 ? ' ' : '');
    });
    h.setAttribute('data-palavras', '');
    h.closest('[data-revela]')?.removeAttribute('data-revela');
  });
  const obsTit = new IntersectionObserver((itens) => itens.forEach((it) => {
    if (it.isIntersecting) { it.target.classList.add('visivel'); obsTit.unobserve(it.target); }
  }), { threshold: .3 });
  titulos.forEach((h) => obsTit.observe(h));

  // Números que contam ao aparecer
  const contar = (el) => {
    const alvo = +el.dataset.conta;
    const dec = +(el.dataset.dec || 0);
    const fmt = (v) => 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    if (calmo) { el.textContent = fmt(alvo); return; }
    const t0 = performance.now();
    const passo = (t) => {
      const k = Math.min(1, (t - t0) / 1100);
      el.textContent = fmt(alvo * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  };

  // Um dia na clínica: o passo no meio da tela escolhe a cena
  const passosDia = $$('.dia-passo');
  const cenas = $$('.cena');
  const telaDia = $('.dia-tela');
  const horaDia = $('[data-dia-hora]');
  let cenaAtual = -1;
  const confirmar = (cena) => {
    const botoes = $$('.conf', cena);
    botoes.forEach((b) => { b.classList.add('pendente'); b.classList.remove('virou'); b.textContent = 'Confirmar'; });
    botoes.forEach((b, i) => setTimeout(() => {
      if (!cena.classList.contains('on')) return;
      b.classList.remove('pendente'); b.classList.add('virou'); b.textContent = 'Confirmado';
    }, calmo ? 0 : 700 + i * 380));
  };
  const mostrarCena = (i) => {
    if (i === cenaAtual) return;
    cenaAtual = i;
    passosDia.forEach((p, j) => p.classList.toggle('ativo', j === i));
    cenas.forEach((c, j) => c.classList.toggle('on', j === i));
    horaDia.textContent = $('time', passosDia[i]).textContent;
    telaDia.style.setProperty('--dia-p', ((i + 1) / cenas.length).toFixed(3));
    const cena = cenas[i];
    if ($('.conf', cena)) confirmar(cena);
    $$('[data-conta]', cena).forEach(contar);
  };
  const obsDia = new IntersectionObserver((itens) => itens.forEach((it) => {
    if (it.isIntersecting) mostrarCena(+it.target.dataset.cena);
  }), { rootMargin: matchMedia('(max-width: 960px)').matches ? '-62% 0px -30% 0px' : '-48% 0px -48% 0px' });
  passosDia.forEach((p) => obsDia.observe(p));
  mostrarCena(0);

  // Simulador da maquininha (taxas de exemplo)
  const TAXAS = { pix: [0, 'na hora'], debito: [1.39, 'em 1 dia'], vista: [3.15, 'em 30 dias'] };
  const taxaParcelado = (n) => [3.15 + (n - 1) * 0.72, 'em 30 dias, parcela a parcela'];
  const sim = $('[data-sim]');
  const sValor = $('[data-sim-valor]');
  const sParc = $('[data-sim-parcelas]');
  const caixaParc = $('[data-sim-parc]');
  const moeda = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const out = { valor: $('[data-sim-valor-txt]'), parc: $('[data-sim-parc-txt]'), taxa: $('[data-sim-taxa]'), pct: $('[data-sim-pct]'), liq: $('[data-sim-liq]'), quando: $('[data-sim-quando]'), barra: $('[data-sim-barra]') };
  let liqAtual = +sValor.value;
  const trilhoRange = (r) => r.style.setProperty('--pct', ((r.value - r.min) / (r.max - r.min)) * 100 + '%');
  const calcular = (anima) => {
    const valor = +sValor.value;
    const forma = $('input[name="forma"]:checked', sim).value;
    caixaParc.hidden = forma !== 'parc';
    const n = +sParc.value;
    const [pct, quando] = forma === 'parc' ? taxaParcelado(n) : TAXAS[forma];
    const taxa = Math.round(valor * pct) / 100;
    const liq = valor - taxa;
    out.valor.textContent = 'R$ ' + valor.toLocaleString('pt-BR');
    out.parc.textContent = n + 'x';
    out.taxa.textContent = moeda(taxa);
    out.pct.textContent = pct.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + '%';
    out.quando.textContent = quando;
    out.barra.style.width = (100 - pct) + "%";
    trilhoRange(sValor); trilhoRange(sParc);
    if (anima && !calmo) {
      const de = liqAtual, t0 = performance.now();
      const passo = (t) => {
        const k = Math.min(1, (t - t0) / 450);
        out.liq.textContent = moeda(de + (liq - de) * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(passo);
      };
      requestAnimationFrame(passo);
    } else {
      out.liq.textContent = moeda(liq);
    }
    liqAtual = liq;
  };
  sim.addEventListener('input', () => calcular(true));
  sim.addEventListener('change', (e) => {
    if (e.target.name !== 'forma') return;
    const caixa = out.liq.parentElement;
    caixa.classList.remove('pisca'); void caixa.offsetWidth; caixa.classList.add('pisca');
  });
  calcular(false);

  // Planos: brilho segue o mouse
  $$('.plano').forEach((p) => p.addEventListener('pointermove', (e) => {
    const r = p.getBoundingClientRect();
    p.style.setProperty('--mx', e.clientX - r.left + 'px');
    p.style.setProperty('--my', e.clientY - r.top + 'px');
  }));

  // Janela do topo inclina levemente com o mouse
  const tilt = $('[data-tilt]');
  if (!calmo && matchMedia('(pointer: fine)').matches) {
    demo.addEventListener('pointermove', (e) => {
      const r = demo.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      tilt.style.transform = `perspective(1400px) rotateY(${(x * 7).toFixed(2)}deg) rotateX(${(-y * 6).toFixed(2)}deg)`;
    });
    demo.addEventListener('pointerleave', () => { tilt.style.transform = ''; });
  }
})();
