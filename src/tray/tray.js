let state = null;

const devicesEl = document.getElementById('devices');
const countEl = document.getElementById('count');
const launchEl = document.getElementById('launch');
const syncIconEl = document.getElementById('sync-icon');
const syncLabelEl = document.getElementById('sync-label');

async function init() {
  state = await window.ianyPeek.getState();
  render();

  window.ianyPeek.onStateChanged((nextState) => {
    state = nextState;
    render();
  });

  document.getElementById('settings').addEventListener('click', () => {
    window.ianyPeek.openSettingsFromTray();
  });

  document.getElementById('sync').addEventListener('click', async () => {
    state = await window.ianyPeek.syncNowFromTray();
    render();
  });

  launchEl.addEventListener('change', async () => {
    const desired = launchEl.checked;
    state = {
      ...state,
      settings: {
        ...state.settings,
        launchAtLogin: desired
      }
    };
    render();
    state = await window.ianyPeek.setLaunchAtLogin(launchEl.checked);
    render();
  });

  document.getElementById('quit').addEventListener('click', () => {
    window.ianyPeek.quitApp();
  });
}

function render() {
  const devices = state?.book?.devices || [];
  countEl.textContent = `${devices.length} máquina${devices.length === 1 ? '' : 's'}`;
  launchEl.checked = Boolean(state?.settings?.launchAtLogin);

  const syncing = Boolean(state?.settings?.syncInProgress);
  syncIconEl.classList.toggle('spinning', syncing);
  syncLabelEl.textContent = syncing ? 'Sincronizando...' : 'Sincronizar agora';

  devicesEl.innerHTML = '';
  if (!devices.length) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = 'Nenhuma máquina cadastrada.';
    devicesEl.append(empty);
    return;
  }

  for (const device of devices) {
    const button = document.createElement('button');
    button.className = 'device';
    button.type = 'button';
    button.innerHTML = `
      <span class="device-icon">▸</span>
      <span>
        <strong>${escapeHtml(device.name)}</strong>
        <small>${formatAnyDeskId(device.anydeskId)}</small>
      </span>
    `;
    button.addEventListener('click', async () => {
      await window.ianyPeek.connectDevice(device.anydeskId);
      await window.ianyPeek.hideTray();
    });
    devicesEl.append(button);
  }
}

function formatAnyDeskId(value) {
  return String(value || '').replace(/(\d{3})(?=\d)/g, '$1 ').trim();
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

init();
