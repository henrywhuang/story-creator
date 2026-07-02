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
        status: item.audioSrc ? '已有音频' : item.classic ? '待补歌词文稿' : '待写词曲脚本',
        source: item.classic ? 'classic' : 'original',
        audioSrc: item.audioSrc,
        textStatus: item.lyricsText ? '已录入歌词' : '待补歌词文稿',
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
                    <span>{isSongGroup ? row.type : `${row.count} 集`}</span>
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
