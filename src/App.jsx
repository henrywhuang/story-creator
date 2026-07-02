import { useMemo, useState } from 'react';
import {
  BookOpen,
  Brain,
  ChevronRight,
  CircleDot,
  FileText,
  FlaskConical,
  Headphones,
  Languages,
  LibraryBig,
  ListChecks,
  Moon,
  Music2,
  PlayCircle,
  ScrollText,
  Search,
  Sprout,
} from 'lucide-react';
import { contentGroups } from './data/contentGroups';
import { songPlanCategories, songPlanItems } from './data/songPlans';

const songProductionDefaults = {
  中文儿歌: {
    duration: '45-60 秒',
    bpm: '82-96 BPM',
    tempo: '中慢速，方便 2-4 岁儿童跟唱',
    vocal: 'warm childlike Mandarin vocal, gentle adult harmony optional',
    arrangement: 'clear melody, short repeated phrases, soft ending pauses, uncluttered arrangement',
    instruments: ['钢琴', '木琴', '轻打击', '手铃'],
    exclude: 'rock guitar, heavy drums, EDM drop, rap vocal, autotune, scary sound effects, overly fast tempo',
  },
  手指谣: {
    duration: '30-45 秒',
    bpm: '78-92 BPM',
    tempo: '稳定慢速，动作点明确',
    vocal: 'soft Mandarin toddler-group vocal, clear action cues',
    arrangement: 'clear beats for finger actions, short pauses after action words, parent-child call and response',
    instruments: ['木鱼', '手鼓', '响板', '钢片琴'],
    exclude: 'complex syncopation, dense percussion, distorted instruments, dramatic cinematic mood',
  },
  谜语儿歌: {
    duration: '45-60 秒',
    bpm: '84-98 BPM',
    tempo: '中速，谜面后留 1-2 秒思考空隙',
    vocal: 'playful Mandarin child vocal with curious question delivery',
    arrangement: 'riddle setup, short pause, cheerful reveal, simple memorable refrain',
    instruments: ['拨弦', '木琴', '沙锤', '轻鼓点'],
    exclude: 'dark mystery, suspense horror, fast rap, loud brass, heavy bass',
  },
  动作律动儿歌: {
    duration: '50-70 秒',
    bpm: '96-112 BPM',
    tempo: '中速偏活泼，动作循环清楚',
    vocal: 'bright Mandarin children vocal, emphasized action words',
    arrangement: 'short verse, repeated movement hook, clear clap and stomp cues, easy loop for 2-4 year olds',
    instruments: ['尤克里里', '手鼓', '拍手声', '低音鼓'],
    exclude: 'club beat, aggressive drums, complex lyrics, adult pop vocal style, very high pitch',
  },
};

const instrumentEnglishMap = {
  钢琴: 'soft piano',
  木琴: 'xylophone',
  轻打击: 'light percussion',
  手铃: 'hand bells',
  木鱼: 'wood block',
  手鼓: 'hand drum',
  响板: 'claves',
  钢片琴: 'glockenspiel',
  拨弦: 'light plucked strings',
  沙锤: 'shaker',
  轻鼓点: 'soft drum groove',
  尤克里里: 'ukulele',
  拍手声: 'hand claps',
  低音鼓: 'soft kick drum',
};

function buildSunoConfig(item) {
  const instruments = item.production?.instruments ?? [];
  const englishInstruments = instruments.map((name) => instrumentEnglishMap[name] ?? name).join(', ');
  const stylePrompt = [
    `Mandarin nursery rhyme for Chinese-speaking children ages 2-4`,
    `${item.production?.bpm ?? '90 BPM'}, ${item.production?.duration ?? '45-60 seconds'}`,
    item.production?.vocal,
    item.production?.arrangement,
    `Instrumentation: ${englishInstruments}`,
    `Mood: warm, safe, playful, simple, parent-child friendly`,
    `Structure: short intro, verse, repeated chorus, gentle outro`,
  ]
    .filter(Boolean)
    .join('. ');

  const lyricPrompt = item.lyricsText?.trim()
    ? item.lyricsText.trim()
    : `[Verse]\n待录入完整歌词文本\n\n[Chorus]\n待录入可重复副歌\n\n[Outro]\n轻柔收尾`;

  return {
    title: item.title,
    customMode: 'On',
    instrumental: 'Off',
    styles: stylePrompt,
    lyrics: lyricPrompt,
    exclude: item.production?.exclude ?? 'heavy drums, distorted guitars, scary sounds, rap vocal',
  };
}

const iconMap = {
  Music2,
  Moon,
  Sprout,
  Brain,
  BookOpen,
  FlaskConical,
  ScrollText,
  Languages,
};

function App() {
  const [activeGroupId, setActiveGroupId] = useState('songs');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('song-001');

  const groups = useMemo(() => {
    const detailTotal = contentGroups.reduce(
      (sum, group) => sum + group.items.reduce((itemSum, item) => itemSum + item.count, 0),
      0,
    );

    return contentGroups.map((group) => {
      const detailTotalByGroup = group.items.reduce((sum, item) => sum + item.count, 0);
      return {
        ...group,
        detailTotal: detailTotalByGroup,
        share: (detailTotalByGroup / detailTotal) * 100,
      };
    });
  }, []);

  const activeGroup = groups.find((group) => group.id === activeGroupId) ?? groups[0];
  const ActiveIcon = iconMap[activeGroup.icon];
  const isSongGroup = activeGroup.id === 'songs';

  const boardStats = useMemo(() => {
    const total = groups.reduce((sum, group) => sum + group.detailTotal, 0);
    const columns = groups.reduce((sum, group) => sum + group.items.length, 0);
    const classicSongs = songPlanItems.filter((item) => item.classic).length;

    return {
      total,
      groups: groups.length,
      columns,
      classicSongs,
      songTotal: songPlanItems.length,
    };
  }, [groups]);

  const activeRows = useMemo(() => {
    if (isSongGroup) {
      return songPlanItems.map((item) => ({
        id: item.id,
        title: item.title,
        category: item.category,
        count: 1,
        type: item.classic ? '经典儿歌' : '原创选题',
        scene: item.scene,
        goal: item.goal,
        status: item.audioSrc ? '已有音频' : item.lyricsText ? '已有歌词' : '待录入歌词',
        source: item.classic ? 'classic' : 'original',
        audioSrc: item.audioSrc,
        lyricsText: item.lyricsText ?? '',
        textStatus: item.lyricsText ? '已录入完整歌词' : '待录入完整歌词',
        production: item.production ?? songProductionDefaults[item.category],
        suno: buildSunoConfig({
          ...item,
          lyricsText: item.lyricsText ?? '',
          production: item.production ?? songProductionDefaults[item.category],
        }),
      }));
    }

    return activeGroup.items.map((item, index) => ({
      id: `${activeGroup.id}-${index}`,
      title: item.name,
      category: activeGroup.title,
      count: item.count,
      type: '栏目',
      scene: item.description,
      goal: activeGroup.positioning,
      status: '待拆单集',
      source: 'column',
    }));
  }, [activeGroup, isSongGroup]);

  const categoryOptions = useMemo(() => {
    if (isSongGroup) {
      return songPlanCategories;
    }

    return activeGroup.items.map((item) => item.name);
  }, [activeGroup, isSongGroup]);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return activeRows.filter((row) => {
      const matchesCategory = categoryFilter === 'all' || row.category === categoryFilter || row.title === categoryFilter;
      const matchesSource =
        !isSongGroup ||
        sourceFilter === 'all' ||
        (sourceFilter === 'classic' && row.source === 'classic') ||
        (sourceFilter === 'original' && row.source === 'original');

      if (!matchesCategory || !matchesSource) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [row.title, row.category, row.type, row.scene, row.goal]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [activeRows, categoryFilter, isSongGroup, query, sourceFilter]);

  const selectedRow =
    filteredRows.find((row) => row.id === selectedId) ??
    activeRows.find((row) => row.id === selectedId) ??
    filteredRows[0] ??
    activeRows[0];

  const handleGroupChange = (groupId) => {
    const nextGroup = groups.find((group) => group.id === groupId);
    setActiveGroupId(groupId);
    setCategoryFilter('all');
    setSourceFilter('all');
    setQuery('');

    if (groupId === 'songs') {
      setSelectedId(songPlanItems[0].id);
      return;
    }

    setSelectedId(`${nextGroup.id}-0`);
  };

  return (
    <div className="board-app">
      <header className="board-topbar">
        <a className="brand" href="#content-board" aria-label="故事机内容看板">
          <LibraryBig aria-hidden="true" />
          <span>故事机内容看板</span>
        </a>
        <div className="topbar-summary">
          <span>{boardStats.total} 集</span>
          <span>{boardStats.groups} 大类</span>
          <span>{boardStats.columns} 栏目</span>
        </div>
      </header>

      <div className="board-shell" id="content-board">
        <aside className="side-nav" aria-label="内容类型">
          <div className="side-nav__heading">
            <span>内容目录</span>
            <strong>{boardStats.total}</strong>
          </div>

          <nav className="group-nav">
            {groups.map((group) => {
              const Icon = iconMap[group.icon];
              const isActive = activeGroup.id === group.id;

              return (
                <button
                  className={isActive ? 'is-active' : ''}
                  key={group.id}
                  onClick={() => handleGroupChange(group.id)}
                  style={{ '--accent': group.accent }}
                  type="button"
                >
                  <span className="nav-icon" aria-hidden="true">
                    <Icon size={18} />
                  </span>
                  <span>
                    <strong>{group.title}</strong>
                    <small>{group.detailTotal} 集</small>
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="board-main">
          <section className="board-heading" style={{ '--accent': activeGroup.accent }}>
            <div className="heading-icon" aria-hidden="true">
              <ActiveIcon size={26} />
            </div>
            <div>
              <p>完整内容看板</p>
              <h1>{activeGroup.title}</h1>
              <span>{activeGroup.subtitle}</span>
            </div>
          </section>

          <section className="stat-row" aria-label="当前内容统计">
            <Metric label="当前集数" value={`${activeGroup.detailTotal} 集`} />
            <Metric label="细分栏目" value={`${activeGroup.items.length} 个`} />
            <Metric label="内容占比" value={`${activeGroup.share.toFixed(1)}%`} />
            <Metric
              label={isSongGroup ? '经典儿歌' : '制作状态'}
              value={isSongGroup ? `${boardStats.classicSongs}/${boardStats.songTotal}` : '待拆单集'}
            />
          </section>

          <section className="taxonomy-panel" aria-label="栏目结构">
            {activeGroup.items.map((item) => (
              <button
                className={categoryFilter === item.name ? 'is-active' : ''}
                key={item.name}
                onClick={() => setCategoryFilter(categoryFilter === item.name ? 'all' : item.name)}
                type="button"
              >
                <span>{item.name}</span>
                <strong>{item.count}</strong>
              </button>
            ))}
          </section>

          <section className="workbench">
            <div className="content-list-panel">
              <div className="list-toolbar">
                <label className="search-box">
                  <Search size={17} aria-hidden="true" />
                  <span className="sr-only">搜索内容</span>
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="搜索标题、栏目、场景"
                  />
                </label>

                <div className="filter-row" aria-label="筛选内容">
                  <button
                    className={categoryFilter === 'all' ? 'is-active' : ''}
                    onClick={() => setCategoryFilter('all')}
                    type="button"
                  >
                    全部栏目
                  </button>
                  {isSongGroup && (
                    <>
                      <button
                        className={sourceFilter === 'classic' ? 'is-active' : ''}
                        onClick={() => setSourceFilter(sourceFilter === 'classic' ? 'all' : 'classic')}
                        type="button"
                      >
                        经典
                      </button>
                      <button
                        className={sourceFilter === 'original' ? 'is-active' : ''}
                        onClick={() => setSourceFilter(sourceFilter === 'original' ? 'all' : 'original')}
                        type="button"
                      >
                        原创
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="content-table" role="list" aria-label={`${activeGroup.title}内容条目`}>
                <div className="content-table__head" aria-hidden="true">
                  <span>内容</span>
                  <span>栏目</span>
                  <span>{isSongGroup ? '来源' : '集数'}</span>
                  <span>状态</span>
                </div>

                {filteredRows.map((row, index) => (
                  <button
                    className={selectedRow?.id === row.id ? 'content-row is-selected' : 'content-row'}
                    key={row.id}
                    onClick={() => setSelectedId(row.id)}
                    type="button"
                  >
                    <span className="row-title">
                      <small>{String(index + 1).padStart(2, '0')}</small>
                      <strong>{row.title}</strong>
                    </span>
                    <span>{row.category}</span>
                    <span>
                      {isSongGroup ? (
                        <em className={row.source === 'classic' ? 'row-source-tag classic' : 'row-source-tag'}>
                          {row.source === 'classic' ? '经典' : '原创'}
                        </em>
                      ) : (
                        `${row.count} 集`
                      )}
                    </span>
                    <span>{row.status}</span>
                    <ChevronRight size={16} aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>

            <DetailPanel item={selectedRow} isSongGroup={isSongGroup} group={activeGroup} />
          </section>
        </main>
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function DetailPanel({ group, isSongGroup, item }) {
  if (!item) {
    return (
      <aside className="detail-panel">
        <p className="empty-detail">没有匹配内容</p>
      </aside>
    );
  }

  return (
    <aside className="detail-panel" style={{ '--accent': group.accent }}>
      <div className="detail-panel__top">
        <span className="detail-type">{item.type}</span>
        <h2>{item.title}</h2>
        <p>{item.scene}</p>
      </div>

      <div className="detail-fields">
        <DetailField icon={CircleDot} label="栏目" value={item.category} />
        <DetailField icon={ListChecks} label="制作状态" value={item.status} />
        <DetailField icon={FileText} label={isSongGroup ? '选题目标' : '栏目定位'} value={item.goal} />
      </div>

      {isSongGroup && (
        <>
          <section className="lyric-panel" aria-label="完整歌词文本">
            <div className="detail-section-heading">
              <FileText size={16} aria-hidden="true" />
              <h3>完整歌词文本</h3>
            </div>
            <pre>{item.lyricsText?.trim() || '待录入完整歌词文本'}</pre>
          </section>

          <section className="production-panel" aria-label="Suno 生成配置">
            <div className="detail-section-heading">
              <ListChecks size={16} aria-hidden="true" />
              <h3>Suno 生成配置</h3>
            </div>
            <div className="suno-fields">
              <SunoField label="Title" value={item.suno?.title} />
              <SunoField label="Custom Mode" value={item.suno?.customMode} compact />
              <SunoField label="Instrumental" value={item.suno?.instrumental} compact />
              <SunoField label="Styles" value={item.suno?.styles} multiline />
              <SunoField label="Lyrics" value={item.suno?.lyrics} multiline pre />
              <SunoField label="Exclude" value={item.suno?.exclude} multiline />
            </div>
            <div className="instrument-tags" aria-label="乐器">
              {item.production?.instruments?.map((instrument) => (
                <span key={instrument}>{instrument}</span>
              ))}
            </div>
          </section>
        </>
      )}

      <div className="asset-slots" aria-label="内容资产">
        <AssetSlot icon={FileText} label="文本" value={item.textStatus ?? '待补正文/脚本'} />
        <AssetSlot icon={Headphones} label="音频" value={item.audioSrc ? '已接入音频' : '待录制/上传'}>
          {item.audioSrc && <audio controls preload="metadata" src={item.audioSrc} />}
        </AssetSlot>
        <AssetSlot icon={PlayCircle} label="成品" value="待审核发布" />
      </div>
    </aside>
  );
}

function DetailField({ icon: Icon, label, value }) {
  return (
    <div className="detail-field">
      <Icon size={16} aria-hidden="true" />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SunoField({ compact = false, label, multiline = false, pre = false, value }) {
  return (
    <div className={compact ? 'suno-field compact' : 'suno-field'}>
      <span>{label}</span>
      {pre ? <pre>{value}</pre> : <strong className={multiline ? 'multiline' : ''}>{value}</strong>}
    </div>
  );
}

function AssetSlot({ children, icon: Icon, label, value }) {
  return (
    <div className="asset-slot">
      <Icon size={18} aria-hidden="true" />
      <span>{label}</span>
      <strong>{value}</strong>
      {children && <div className="asset-slot__body">{children}</div>}
    </div>
  );
}

export default App;
