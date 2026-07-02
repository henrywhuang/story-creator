import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
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
  Maximize2,
  Moon,
  Music2,
  PlayCircle,
  ScrollText,
  Search,
  Sprout,
  X,
} from 'lucide-react';
import { contentGroups } from './data/contentGroups';
import { classicStoryItems } from './data/classicStories';
import { growthStoryItems } from './data/growthStories';
import { sleepStoryItems } from './data/sleepStories';
import { getSelectionSkill } from './data/storySelectionSkills';
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
  const isClassicSong = item.classic === true;
  const instruments = item.production?.instruments ?? [];
  const englishInstruments = instruments.map((name) => instrumentEnglishMap[name] ?? name).join(', ');
  const stylePrompt = isClassicSong
    ? ''
    : [
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

  const lyricPrompt = item.sunoLyrics?.trim()
    ? item.sunoLyrics.trim()
    : item.lyricsText?.trim()
      ? item.lyricsText.trim()
      : `[Verse]\n待录入完整歌词文本\n\n[Chorus]\n待录入可重复副歌\n\n[Outro]\n轻柔收尾`;

  return {
    title: item.title,
    customMode: 'On',
    instrumental: 'Off',
    styles: stylePrompt,
    lyrics: lyricPrompt,
    exclude: isClassicSong ? '' : item.production?.exclude ?? 'heavy drums, distorted guitars, scary sounds, rap vocal',
  };
}

function getAudioTracks(item) {
  const toPlayableSrc = (src) => {
    if (!src || /^(https?:|data:|blob:)/.test(src)) {
      return src;
    }

    const base = import.meta.env.BASE_URL || '/';

    if (src.startsWith(base)) {
      return src;
    }

    return `${base}${src.replace(/^\/+/, '')}`;
  };

  if (item.audioTracks?.length) {
    return item.audioTracks.map((track) => ({
      ...track,
      src: toPlayableSrc(track.src),
    }));
  }

  if (item.audioSrc) {
    return [{ label: '音频', src: toPlayableSrc(item.audioSrc) }];
  }

  return [];
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
  const [audioFilter, setAudioFilter] = useState('all');
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
  const isSleepGroup = activeGroup.id === 'sleep';
  const isGrowthGroup = activeGroup.id === 'growth';
  const isClassicGroup = activeGroup.id === 'classic';

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
      return songPlanItems.map((item) => {
        const audioTracks = getAudioTracks(item);

        return {
          id: item.id,
          title: item.title,
          category: item.category,
          count: 1,
          type: item.classic ? '经典儿歌' : '原创选题',
          scene: item.scene,
          goal: item.goal,
          status: audioTracks.length > 1 ? `已有 ${audioTracks.length} 版音频` : audioTracks.length === 1 ? '已有音频' : item.lyricsText ? '已有歌词' : '待录入歌词',
          source: item.classic ? 'classic' : 'original',
          classicReview: item.classicReview,
          audioSrc: audioTracks[0]?.src,
          audioTracks,
          lyricsText: item.lyricsText ?? '',
          textStatus: item.lyricsText ? '已录入完整歌词' : '待录入完整歌词',
          production: item.production ?? songProductionDefaults[item.category],
          suno: buildSunoConfig({
            ...item,
            lyricsText: item.lyricsText ?? '',
            production: item.production ?? songProductionDefaults[item.category],
          }),
        };
      });
    }

    if (isSleepGroup) {
      return sleepStoryItems.map((item) => ({
        id: item.id,
        title: item.title,
        category: item.category,
        count: 1,
        type: '已选故事',
        scene: '已从教研目录录入，适合睡前播放的低刺激故事情节概要。',
        goal: '睡前低刺激、温暖、安抚，帮助孩子进入入睡节奏。',
        status: '已达 3-5 分钟正文',
        source: 'selected',
        plotOutline: item.plotOutline,
        fullText: item.fullText,
        textStatus: '已达 3-5 分钟正文',
      }));
    }

    if (isGrowthGroup) {
      return growthStoryItems.map((item) => ({
        id: item.id,
        title: item.title,
        category: item.category,
        count: 1,
        type: '已选故事',
        scene: item.scene,
        goal: item.goal,
        status: '已达 3-5 分钟正文',
        source: 'selected',
        plotOutline: item.plotOutline,
        fullText: item.fullText,
        textStatus: '已达 3-5 分钟正文',
      }));
    }

    if (isClassicGroup) {
      return classicStoryItems.map((item) => ({
        id: item.id,
        title: item.title,
        category: item.category,
        count: 1,
        type: '经典故事',
        scene: item.plotOutline ?? item.storyBrief,
        goal: '按经典故事改编 Skills 改写为适合 2-4 岁收听的 3-5 分钟故事。',
        status: item.fullText ? '已达 3-5 分钟正文' : item.hasExistingStory ? '已有故事' : '已放入选题池',
        source: item.source,
        sourceLabel: item.sourceLabel,
        hasExistingStory: item.hasExistingStory,
        plotOutline: item.plotOutline,
        fullText: item.fullText,
        textStatus: item.fullText ? '已达 3-5 分钟正文' : item.hasExistingStory ? '已有故事，不补正文' : '待写概要/正文',
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
  }, [activeGroup, isClassicGroup, isGrowthGroup, isSleepGroup, isSongGroup]);

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
      const matchesAudio =
        !isSongGroup || audioFilter === 'all' || (audioFilter === 'withAudio' && row.audioTracks?.length > 0);

      if (!matchesCategory || !matchesSource || !matchesAudio) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [row.title, row.category, row.type, row.sourceLabel, row.scene, row.goal, row.plotOutline, row.fullText]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [activeRows, audioFilter, categoryFilter, isSongGroup, query, sourceFilter]);

  const hasActiveFilters =
    categoryFilter !== 'all' || sourceFilter !== 'all' || audioFilter !== 'all' || query.trim().length > 0;
  const selectedRow =
    filteredRows.find((row) => row.id === selectedId) ??
    filteredRows[0] ??
    (hasActiveFilters ? undefined : activeRows.find((row) => row.id === selectedId) ?? activeRows[0]);
  const activeSkill = getSelectionSkill(
    activeGroup.id,
    categoryFilter !== 'all' ? categoryFilter : selectedRow?.category,
  );

  const handleGroupChange = (groupId) => {
    const nextGroup = groups.find((group) => group.id === groupId);
    setActiveGroupId(groupId);
    setCategoryFilter('all');
    setSourceFilter('all');
    setAudioFilter('all');
    setQuery('');

    if (groupId === 'songs') {
      setSelectedId(songPlanItems[0].id);
      return;
    }

    if (groupId === 'sleep') {
      setSelectedId(sleepStoryItems[0].id);
      return;
    }

    if (groupId === 'growth') {
      setSelectedId(growthStoryItems[0].id);
      return;
    }

    if (groupId === 'classic') {
      setSelectedId(classicStoryItems[0].id);
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
            {activeSkill && (
              <SelectionSkillCard key={`${activeGroup.id}-${activeSkill.categoryName}`} skill={activeSkill} />
            )}
          </section>

          <section className="stat-row" aria-label="当前内容统计">
            <Metric label="当前集数" value={`${activeGroup.detailTotal} 集`} />
            <Metric label="细分栏目" value={`${activeGroup.items.length} 个`} />
            <Metric label="内容占比" value={`${activeGroup.share.toFixed(1)}%`} />
            <Metric
              label={
                isSongGroup
                  ? '经典儿歌'
                  : isSleepGroup || isGrowthGroup
                    ? '已选故事'
                    : isClassicGroup
                      ? '已放入故事'
                      : '制作状态'
              }
              value={
                isSongGroup
                  ? `${boardStats.classicSongs}/${boardStats.songTotal}`
                  : isSleepGroup
                    ? `${sleepStoryItems.length}/${activeGroup.detailTotal}`
                    : isGrowthGroup
                      ? `${growthStoryItems.length}/${activeGroup.detailTotal}`
                      : isClassicGroup
                        ? `${classicStoryItems.length}/${activeGroup.detailTotal}`
                        : '待拆单集'
              }
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
                      <button
                        className={audioFilter === 'withAudio' ? 'is-active' : ''}
                        onClick={() => setAudioFilter(audioFilter === 'withAudio' ? 'all' : 'withAudio')}
                        type="button"
                      >
                        有音频
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="content-table" role="list" aria-label={`${activeGroup.title}内容条目`}>
                <div className="content-table__head" aria-hidden="true">
                  <span>内容</span>
                  <span>栏目</span>
                  <span>
                    {isSongGroup || isClassicGroup
                      ? '来源'
                      : isSleepGroup || isGrowthGroup
                        ? '类型'
                        : '集数'}
                  </span>
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
                      {row.hasExistingStory && (
                        <span className="existing-story-star" aria-label="已有故事" title="已有故事">
                          ★
                        </span>
                      )}
                      <strong>{row.title}</strong>
                    </span>
                    <span>{row.category}</span>
                    <span>
                      {isSongGroup ? (
                        <em className={row.source === 'classic' ? 'row-source-tag classic' : 'row-source-tag'}>
                          {row.source === 'classic' ? row.classicReview?.label ?? '经典' : '原创'}
                        </em>
                      ) : isClassicGroup ? (
                        row.sourceLabel
                      ) : isSleepGroup || isGrowthGroup ? (
                        row.type
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

            <DetailPanel
              group={activeGroup}
              isStoryGroup={isSleepGroup || isGrowthGroup || isClassicGroup}
              isSongGroup={isSongGroup}
              item={selectedRow}
            />
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

function SelectionSkillCard({ skill }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside className={isExpanded ? 'selection-skill-card is-open' : 'selection-skill-card'} aria-label="选题 Skills">
      <div className="selection-skill-card__summary">
        <div className="selection-skill-card__summary-copy">
          <div className="selection-skill-card__top">
            <span>{skill.label}</span>
            <strong>{skill.ageRange}</strong>
          </div>
          <h2>{skill.categoryName}</h2>
          <p>{skill.current.intent}</p>
        </div>
        <button
          aria-expanded={isExpanded}
          aria-label={isExpanded ? '收起 Skills' : '展开 Skills'}
          className="selection-skill-card__toggle"
          onClick={() => setIsExpanded((current) => !current)}
          title={isExpanded ? '收起 Skills' : '展开 Skills'}
          type="button"
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>

      {isExpanded && (
        <div className="selection-skill-card__body">
          <div className="skill-tags">
            {skill.current.standards.map((standard) => (
              <span key={standard}>{standard}</span>
            ))}
          </div>
          <dl>
            <div>
              <dt>去重</dt>
              <dd>{skill.current.topicGuard.join(' / ')}</dd>
            </div>
            <div>
              <dt>结构</dt>
              <dd>{skill.current.structure}</dd>
            </div>
            <div>
              <dt>避开</dt>
              <dd>{skill.current.avoid.join(' / ')}</dd>
            </div>
          </dl>
          <div className="writing-skill">
            <div className="writing-skill__top">
              <span>{skill.writing.label}</span>
              <strong>
                {skill.writing.duration} · {skill.writing.wordCount}
              </strong>
            </div>
            <p>{skill.writing.structure}</p>
            {skill.writing.storyShapes?.length > 0 && (
              <div className="writing-guidelines">
                <span>叙事形状</span>
                <p>{skill.writing.storyShapes.join(' / ')}</p>
              </div>
            )}
            <div className="writing-guidelines">
              <span>2-4 岁听感</span>
              <p>{skill.writing.toddlerFit.join(' / ')}</p>
              <span>必备</span>
              <p>{skill.writing.mustHave.join(' / ')}</p>
              <span>避开</span>
              <p>{skill.writing.avoid.join(' / ')}</p>
            </div>
            <div className="skill-tags compact">
              {skill.writing.listenability.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

function DetailPanel({ group, isStoryGroup, isSongGroup, item }) {
  const [isStoryReaderOpen, setIsStoryReaderOpen] = useState(false);

  if (!item) {
    return (
      <aside className="detail-panel">
        <p className="empty-detail">没有匹配内容</p>
      </aside>
    );
  }

  const isClassicSong = isSongGroup && item.source === 'classic';
  const audioTracks = item.audioTracks ?? (item.audioSrc ? [{ label: '音频', src: item.audioSrc }] : []);
  const storyText = item.fullText ?? '待写完整故事正文';

  return (
    <aside className="detail-panel" style={{ '--accent': group.accent }}>
      <div className="detail-panel__top">
        <span className="detail-type">{item.type}</span>
        <h2>
          {item.hasExistingStory && (
            <span className="existing-story-star detail" aria-label="已有故事" title="已有故事">
              ★
            </span>
          )}
          {item.title}
        </h2>
        <p>{item.scene}</p>
      </div>

      <div className="detail-fields">
        <DetailField icon={CircleDot} label="栏目" value={item.category} />
        <DetailField icon={ListChecks} label="制作状态" value={item.status} />
        <DetailField
          icon={FileText}
          label={isSongGroup || isStoryGroup || group.id === 'classic' ? '选题目标' : '栏目定位'}
          value={item.goal}
        />
        {isSongGroup && item.classicReview && (
          <DetailField
            icon={LibraryBig}
            label="经典审查"
            value={`${item.classicReview.label} / 置信度${item.classicReview.confidence}：${item.classicReview.note}`}
          />
        )}
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
              <SunoField label="Lyrics" value={item.suno?.lyrics} multiline pre />
              {item.suno?.styles && <SunoField label="Styles" value={item.suno.styles} multiline />}
              {item.suno?.exclude && <SunoField label="Exclude" value={item.suno.exclude} multiline />}
            </div>
            {!isClassicSong && item.production?.instruments?.length > 0 && (
              <div className="instrument-tags" aria-label="乐器">
                {item.production.instruments.map((instrument) => (
                  <span key={instrument}>{instrument}</span>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {isStoryGroup && (
        <>
          <section className="outline-panel" aria-label="故事情节概要">
            <div className="detail-section-heading">
              <FileText size={16} aria-hidden="true" />
              <h3>故事情节概要</h3>
            </div>
            <p>{item.plotOutline ?? '待写情节概要'}</p>
          </section>

          <section className="lyric-panel" aria-label="完整故事正文">
            <div className="detail-section-heading has-action">
              <span>
                <FileText size={16} aria-hidden="true" />
                <h3>完整故事正文</h3>
              </span>
              <button
                aria-label="放大完整故事正文"
                className="panel-icon-button"
                onClick={() => setIsStoryReaderOpen(true)}
                title="放大完整故事正文"
                type="button"
              >
                <Maximize2 size={16} aria-hidden="true" />
              </button>
            </div>
            <pre>{storyText}</pre>
          </section>

          {isStoryReaderOpen && (
            <StoryReaderModal
              category={item.category}
              onClose={() => setIsStoryReaderOpen(false)}
              storyText={storyText}
              title={item.title}
            />
          )}
        </>
      )}

      <div className="asset-slots" aria-label="内容资产">
        <AssetSlot icon={FileText} label="文本" value={item.textStatus ?? '待补正文/脚本'} />
        <AssetSlot
          icon={Headphones}
          label="音频"
          value={audioTracks.length > 1 ? `已接入 ${audioTracks.length} 个版本` : audioTracks.length === 1 ? '已接入音频' : '待录制/上传'}
        >
          {audioTracks.length > 0 && <AudioTrackPlayer tracks={audioTracks} />}
        </AssetSlot>
        <AssetSlot icon={PlayCircle} label="成品" value="待审核发布" />
      </div>
    </aside>
  );
}

function StoryReaderModal({ category, onClose, storyText, title }) {
  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      aria-labelledby="story-reader-title"
      aria-modal="true"
      className="story-reader-overlay"
      onClick={onClose}
      role="dialog"
    >
      <section className="story-reader" onClick={(event) => event.stopPropagation()}>
        <div className="story-reader__top">
          <div>
            <span>{category}</span>
            <h2 id="story-reader-title">{title}</h2>
          </div>
          <button
            aria-label="关闭完整故事正文"
            className="panel-icon-button"
            onClick={onClose}
            title="关闭"
            type="button"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <pre>{storyText}</pre>
      </section>
    </div>,
    document.body,
  );
}

function AudioTrackPlayer({ tracks }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const activeIndex = Math.min(selectedIndex, tracks.length - 1);
  const activeTrack = tracks[activeIndex];

  if (!activeTrack) {
    return null;
  }

  return (
    <div className="audio-track-picker">
      {tracks.length > 1 && (
        <div className="audio-track-picker__tabs" aria-label="选择音频版本">
          {tracks.map((track, index) => (
            <button
              className={index === activeIndex ? 'is-active' : ''}
              key={track.src}
              onClick={() => setSelectedIndex(index)}
              type="button"
            >
              {track.label}
            </button>
          ))}
        </div>
      )}
      <audio controls preload="metadata" src={activeTrack.src} />
    </div>
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
